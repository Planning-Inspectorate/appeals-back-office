import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	appealDataFullPlanning,
	documentRedactionStatuses,
	fileUploadInfo,
	proofOfEvidenceForReview
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
/**
 * @param {number} appealId
 * @param {number} folderId
 * @returns {string}
 */
const getFolderApiUrl = (appealId, folderId) =>
	`/appeals/${appealId}/document-folders/${folderId}?pageNumber=1&pageSize=100`;

describe('rule 6 party proof of evidence - add document', () => {
	beforeEach(() => {
		installMockApi();

		nock('http://test/')
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				procedureType: 'inquiry',
				appealStatus: 'statements',
				appealRule6Parties: [
					{
						id: 1,
						serviceUserId: 100,
						partyName: 'Test Rule 6 Party',
						serviceUser: {
							organisationName: 'Test Rule 6 Party'
						}
					}
				],
				rule6PartyId: 1
			})
			.persist();

		nock('http://test/')
			.get('/appeals/2/document-folders')
			.query(true)
			.reply(200, [{ folderId: 1234, path: 'representation/representationAttachments', caseId: 2 }])
			.persist();

		nock('http://test/')
			.get(getFolderApiUrl(2, 1234))
			.reply(200, {
				folderId: 1234,
				caseId: 2,
				path: 'representation/representationAttachments',
				documents: []
			})
			.persist();

		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses)
			.persist();

		nock('http://test/')
			.get('/appeals/2/reps?type=rule_6_party_proofs_evidence')
			.reply(200, {
				...proofOfEvidenceForReview,
				items: [
					{
						...proofOfEvidenceForReview.items[0],
						id: 1,
						represented: {
							...proofOfEvidenceForReview.items[0].represented,
							id: 100
						},
						representedId: 100,
						representationType: 'rule_6_party_proofs_evidence'
					}
				]
			})
			.persist();
	});

	afterEach(teardown);

	const flowBaseUrl = `${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-representation`;

	describe('GET /add-representation', () => {
		it('should render the document upload page with the expected content', async () => {
			const response = await request.get(flowBaseUrl);

			expect(response.statusCode).toBe(200);

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('Upload new proof of evidence and witnesses document');
		});
	});

	describe('POST /add-representation', () => {
		it('should redirect to the document details page after document upload', async () => {
			nock('http://test/').post('/appeals/2/documents').reply(200, {});
			const response = await request.post(flowBaseUrl).send({
				'upload-info': fileUploadInfo
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(`Found. Redirecting to ${flowBaseUrl}/add-document-details`);
		});
	});

	describe('GET /add-representation/add-document-details', () => {
		it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
			const response = await request.get(`${flowBaseUrl}/add-document-details`);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add documents details page', async () => {
			await request.post(`${flowBaseUrl}`).send({
				'upload-info': fileUploadInfo
			});

			const response = await request.get(`${flowBaseUrl}/add-document-details`);
			expect(response.statusCode).toBe(200);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('Add document details</span');
			expect(unprettifiedElement.innerHTML).toContain(
				`Upload new proof of evidence and witnesses document</h1>`
			);
		});
	});

	describe('POST /add-representation/add-document-details', () => {
		beforeEach(async () => {
			await request.post(`${flowBaseUrl}`).send({
				'upload-info': fileUploadInfo
			});
		});

		it(`should re-render add representation documents details page if the request body is in an incorrect format`, async () => {
			const response = await request.post(`${flowBaseUrl}/add-document-details`).send({});

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

			const errorSummaryElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary'
			});

			expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
		});

		it(`should re-render the add representation document details page with the expected error message if receivedDate day is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Supporting document date must include a day`
				},
				{
					value: 'a',
					expectedError: `Supporting document date day must be a number`
				},
				{
					value: '0',
					expectedError: `Supporting document date day must be between 1 and 31`
				},
				{
					value: '32',
					expectedError: `Supporting document date day must be between 1 and 31`
				}
			];

			for (const testCase of testCases) {
				const response = await request.post(`${flowBaseUrl}/add-document-details`).send({
					items: [
						{
							documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: {
								day: testCase.value,
								month: '2',
								year: '2030'
							},
							redactionStatus: 3
						}
					]
				});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render the add representation document details page with the expected error message if receivedDate month is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Supporting document date must include a month`
				},
				{
					value: 'a',
					expectedError: `Supporting document date must be a real date`
				},
				{
					value: '0',
					expectedError: `Supporting document date month must be between 1 and 12`
				},
				{
					value: '13',
					expectedError: `Supporting document date month must be between 1 and 12`
				}
			];

			for (const testCase of testCases) {
				const response = await request.post(`${flowBaseUrl}/add-document-details`).send({
					items: [
						{
							documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: {
								day: '1',
								month: testCase.value,
								year: '2030'
							},
							redactionStatus: 3
						}
					]
				});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render the add representation document details page with the expected error message if receivedDate year is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Supporting document date must include a year`
				},
				{
					value: 'a',
					expectedError: `Supporting document date year must be a number`
				},
				{
					value: '202',
					expectedError: `Supporting document date year must be 4 digits`
				}
			];

			for (const testCase of testCases) {
				const response = await request.post(`${flowBaseUrl}/add-document-details`).send({
					items: [
						{
							documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: {
								day: '1',
								month: '2',
								year: testCase.value
							},
							redactionStatus: 3
						}
					]
				});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render add representation documents details page if receivedDate is not a valid date`, async () => {
			const testCases = [
				{
					value: {
						day: '29',
						month: '2',
						year: 2023
					},
					expectedError: `Supporting document date must be a real date`
				},
				{
					value: {
						day: '',
						month: '',
						year: ''
					},
					expectedError: `Enter the date you received the supporting document`
				},
				{
					value: {
						day: '2',
						month: '',
						year: ''
					},
					expectedError: `Supporting document date must include a month and year`
				},
				{
					value: {
						day: '',
						month: '2',
						year: ''
					},
					expectedError: `Supporting document date must include a day and year`
				},
				{
					value: {
						day: '',
						month: '',
						year: '2025'
					},
					expectedError: `Supporting document date must include a day and month`
				}
			];

			for (const testCase of testCases) {
				const response = await request.post(`${flowBaseUrl}/add-document-details`).send({
					items: [
						{
							documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: testCase.value,
							redactionStatus: 3
						}
					]
				});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should redirect to check your answers if valid details posted`, async () => {
			const response = await request.post(`${flowBaseUrl}/add-document-details`).send({
				items: [
					{
						documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
						receivedDate: {
							day: '1',
							month: '2',
							year: '2023'
						},
						redactionStatus: 3
					}
				]
			});

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(`Found. Redirecting to ${flowBaseUrl}/check-your-answers`);
		});
	});

	describe('GET /add-representation/check-your-answers', () => {
		it('should render the check your answers page with the expected content', async () => {
			await request.post(flowBaseUrl).send({ 'upload-info': fileUploadInfo });

			const response = await request.get(`${flowBaseUrl}/check-your-answers`);

			expect(response.statusCode).toBe(200);

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('Check your answers</h1>');
			expect(unprettifiedHTML).toContain('Appeal 351062</span>');
			expect(unprettifiedHTML).toContain('test-document.txt</a>');
			expect(unprettifiedHTML).toContain('Redaction status</dt>');
			expect(unprettifiedHTML).toContain('Date received</dt>');
		});
	});

	describe('POST /add-representation/check-your-answers', () => {
		it('should call the API to add document and redirect to rule 6 party managed documents page', async () => {
			nock.cleanAll();

			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2,
					procedureType: 'inquiry',
					appealStatus: 'statements',
					appealRule6Parties: [
						{
							id: 1,
							serviceUserId: 100,
							partyName: 'Test Rule 6 Party',
							serviceUser: {
								organisationName: 'Test Rule 6 Party'
							}
						}
					],
					rule6PartyId: 1
				})
				.persist();

			nock('http://test/')
				.get('/appeals/2/document-folders')
				.query(true)
				.reply(200, [
					{ folderId: 1234, path: 'representation/representationAttachments', caseId: 2 }
				])
				.persist();

			nock('http://test/')
				.get(getFolderApiUrl(2, 1234))
				.reply(200, {
					folderId: 1234,
					caseId: 2,
					path: 'representation/representationAttachments',
					documents: []
				})
				.persist();

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();

			nock('http://test/')
				.get('/appeals/2/reps?type=rule_6_party_proofs_evidence')
				.reply(200, {
					...proofOfEvidenceForReview,
					items: [
						{
							...proofOfEvidenceForReview.items[0],
							id: 1,
							represented: {
								...proofOfEvidenceForReview.items[0].represented,
								id: 100
							},
							representedId: 100,
							representationType: 'rule_6_party_proofs_evidence'
						}
					]
				})
				.persist();

			const fileInfo = JSON.parse(fileUploadInfo)[0];

			const mockedPostDocumentEndpoint = nock('http://test/')
				.post('/appeals/2/documents')
				.reply(200, {
					documents: [
						{
							GUID: fileInfo.GUID,
							name: fileInfo.name
						}
					]
				});

			const mockedPatchRepresentationEndpoint = nock('http://test/')
				.patch('/appeals/2/reps/1/attachments')
				.reply(200, {});

			await request.post(flowBaseUrl).send({ 'upload-info': fileUploadInfo });
			await request
				.post(`${flowBaseUrl}/redaction-status`)
				.send({ redactionStatus: 'no_redaction_required' });
			await request
				.post(`${flowBaseUrl}/date-submitted`)
				.send({ 'date-day': '15', 'date-month': '12', 'date-year': '2024' });

			const response = await request.post(`${flowBaseUrl}/check-your-answers`).send({});

			expect(mockedPostDocumentEndpoint.isDone()).toBe(true);
			expect(mockedPatchRepresentationEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/2/proof-of-evidence/rule-6-party/1/manage-documents/1234`
			);
		});
	});

	describe('GET /add-document', () => {
		it('should render the document upload page with the expected content', async () => {
			const response = await request.get(
				`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('Upload new proof of evidence and witnesses document');
		});
	});

	describe('POST /add-document', () => {
		it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
			const response = await request
				.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it(`should render a 500 error page if request body upload-info is in an incorrect format`, async () => {
			const response = await request
				.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document`)
				.send({
					'upload-info': ''
				});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should redirect to the add document details page if upload info is present and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to ${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details`
			);
		});
	});

	describe('GET /add-document/add-document-details', () => {
		it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
			const response = await request.get(
				`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add documents details page', async () => {
			await request.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document`).send({
				'upload-info': fileUploadInfo
			});

			const response = await request.get(
				`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details`
			);
			expect(response.statusCode).toBe(200);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('Add document details</span');
			expect(unprettifiedElement.innerHTML).toContain(
				`Upload new proof of evidence and witnesses document</h1>`
			);
		});
	});

	describe('POST /add-document/add-document-details', () => {
		beforeEach(async () => {
			await request.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document`).send({
				'upload-info': fileUploadInfo
			});
		});

		it(`should re-render add documents details page if the request body is in an incorrect format`, async () => {
			const response = await request
				.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details`)
				.send({});

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

			const errorSummaryElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary'
			});

			expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
		});

		it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Supporting document date must include a day`
				},
				{
					value: 'a',
					expectedError: `Supporting document date day must be a number`
				},
				{
					value: '0',
					expectedError: `Supporting document date day must be between 1 and 31`
				},
				{
					value: '32',
					expectedError: `Supporting document date day must be between 1 and 31`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: testCase.value,
									month: '2',
									year: '2030'
								},
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Supporting document date must include a month`
				},
				{
					value: 'a',
					expectedError: `Supporting document date must be a real date`
				},
				{
					value: '0',
					expectedError: `Supporting document date month must be between 1 and 12`
				},
				{
					value: '13',
					expectedError: `Supporting document date month must be between 1 and 12`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '1',
									month: testCase.value,
									year: '2030'
								},
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Supporting document date must include a year`
				},
				{
					value: 'a',
					expectedError: `Supporting document date year must be a number`
				},
				{
					value: '202',
					expectedError: `Supporting document date year must be 4 digits`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '1',
									month: '2',
									year: testCase.value
								},
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render add documents details page if receivedDate is not a valid date`, async () => {
			const testCases = [
				{
					value: {
						day: '29',
						month: '2',
						year: 2023
					},
					expectedError: `Supporting document date must be a real date`
				},
				{
					value: {
						day: '',
						month: '',
						year: ''
					},
					expectedError: `Enter the date you received the supporting document`
				},
				{
					value: {
						day: '2',
						month: '',
						year: ''
					},
					expectedError: `Supporting document date must include a month and year`
				},
				{
					value: {
						day: '',
						month: '2',
						year: ''
					},
					expectedError: `Supporting document date must include a day and year`
				},
				{
					value: {
						day: '',
						month: '',
						year: '2025'
					},
					expectedError: `Supporting document date must include a day and month`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: testCase.value,
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should redirect to check your answers if valid details posted`, async () => {
			const response = await request
				.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details`)
				.send({
					items: [
						{
							documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: {
								day: '1',
								month: '2',
								year: '2023'
							},
							redactionStatus: 3
						}
					]
				});

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(
				`Found. Redirecting to ${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/check-your-answers`
			);
		});
	});

	describe('GET /add-document/check-your-answers', () => {
		it(`should render check your answers page with correct content`, async () => {
			const response1 = await request
				.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document`)
				.send({
					'upload-info': fileUploadInfo
				});
			expect(response1.statusCode).toBe(302);

			const response2 = await request
				.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details`)
				.send({
					items: [
						{
							documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: {
								day: '1',
								month: '2',
								year: '2023'
							},
							redactionStatus: 3
						}
					]
				});
			expect(response2.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/check-your-answers`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span');
			expect(unprettifiedElement.innerHTML).toContain(`Check your answers</h1>`);
			expect(unprettifiedElement.innerHTML).toContain('File</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt" target="_blank">test-document.txt</a></dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/2/proof-of-evidence/rule-6-party/1/add-document">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /add-document/check-your-answers', () => {
		beforeEach(() => {
			nock('http://test/').post('/appeals/2/documents').reply(200, {}).persist();

			nock('http://test/').patch('/appeals/2/reps/1/attachments').reply(200, {}).persist();
		});

		it(`should redirect to proof of evidence manage documents page`, async () => {
			await request.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document`).send({
				'upload-info': fileUploadInfo
			});

			await request
				.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/add-document-details`)
				.send({
					items: [
						{
							documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: {
								day: '1',
								month: '2',
								year: '2023'
							},
							redactionStatus: 3
						}
					]
				});

			const response = await request
				.post(`${baseUrl}/2/proof-of-evidence/rule-6-party/1/add-document/check-your-answers`)
				.send({});

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(
				`Found. Redirecting to ${baseUrl}/2/proof-of-evidence/rule-6-party/1/manage-documents/1234`
			);
		});
	});

	describe('GET /appeals-service/appeal-details/2/proof-of-evidence/rule-6-party/1', () => {
		it('should render the review screen', async () => {
			const response = await request.get(`${baseUrl}/2/proof-of-evidence/rule-6-party/1`);

			expect(response.statusCode).toBe(200);

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain(
				'Review Test Rule 6 Party proof of evidence and witnesses</h1>'
			);
			expect(unprettifiedHTML).toContain('Review decision</legend>');
			expect(unprettifiedHTML).toContain('Complete</label>');
			expect(unprettifiedHTML).toContain('Mark as incomplete</label>');
		});
	});
});
