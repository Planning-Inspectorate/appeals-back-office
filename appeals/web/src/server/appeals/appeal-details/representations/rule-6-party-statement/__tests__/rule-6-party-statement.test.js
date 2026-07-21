import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	allocationDetailsData,
	appealDataFullPlanning,
	documentRedactionStatuses,
	fileUploadInfo,
	getAppealRepsResponse
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

/** @type {{items: any[], itemCount: number}} */
let repsResponse = { items: [], itemCount: 0 };

describe('rule 6 party statement - add document', () => {
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
			.get('/appeals/2/document-folders?path=representation/representationAttachments')
			.reply(200, [{ folderId: 1234, path: 'representation/representationAttachments' }])
			.persist();

		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses)
			.persist();

		nock('http://test/').post('/appeals/2/documents').reply(200, {}).persist();

		nock('http://test/').patch('/appeals/2/reps/3670/attachments').reply(200, {}).persist();
		nock('http://test/')
			.get('/appeals/2/reps?type=rule_6_party_statement')
			.reply(200, () => repsResponse)
			.persist();

		repsResponse = { items: [], itemCount: 0 };
	});

	afterEach(teardown);

	describe('GET /', () => {
		it('should pre-select "Statement incomplete" when representation status is incomplete and no session status exists', async () => {
			repsResponse = {
				itemCount: 1,
				items: [
					{
						id: 3670,
						status: 'incomplete',
						author: 'Test Rule 6 Party',
						represented: {
							id: 100
						},
						originalRepresentation: 'Statement text',
						attachments: []
					}
				]
			};

			const response = await request.get(
				`${baseUrl}/2/rule-6-party-statement/1?backUrl=/appeals-service/appeal-details/2/share`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(
				'name="status" type="radio" value="incomplete" checked>'
			);
		});
	});

	describe('GET /add-document', () => {
		it('should render the document upload page with the expected content', async () => {
			const response = await request.get(`${baseUrl}/2/rule-6-party-statement/1/add-document`);

			expect(response.statusCode).toBe(200);

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('Upload supporting document');
			expect(unprettifiedHTML).toContain('data-document-title="Rule 6 party statement document"');
		});
	});

	describe('POST /add-document', () => {
		it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
			const response = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document`)
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
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document`)
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

		it('should redirect to the add document details page after document upload', async () => {
			const response = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/2/rule-6-party-statement/1/add-document/add-document-details`
			);
		});
	});

	describe('GET /add-document/add-document-details', () => {
		it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
			const response = await request.get(
				`${baseUrl}/2/rule-6-party-statement/1/add-document/add-document-details`
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
			await request.post(`${baseUrl}/2/rule-6-party-statement/1/add-document`).send({
				'upload-info': fileUploadInfo
			});

			const response = await request.get(
				`${baseUrl}/2/rule-6-party-statement/1/add-document/add-document-details`
			);
			expect(response.statusCode).toBe(200);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('Add document details</span');
			expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);
		});
	});

	describe('POST /add-document/add-document-details', () => {
		beforeEach(async () => {
			await request.post(`${baseUrl}/2/rule-6-party-statement/1/add-document`).send({
				'upload-info': fileUploadInfo
			});
		});

		it(`should re-render add documents details page if the request body is in an incorrect format`, async () => {
			const response = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/add-document-details`)
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
					.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/add-document-details`)
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
					.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/add-document-details`)
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
					.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/add-document-details`)
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
					.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/add-document-details`)
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
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/add-document-details`)
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
				`Found. Redirecting to ${baseUrl}/2/rule-6-party-statement/1/add-document/check-your-answers`
			);
		});
	});

	describe('GET /add-document/check-your-answers', () => {
		it('should render the check your answers page with the expected content', async () => {
			const response1 = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document`)
				.send({
					'upload-info': fileUploadInfo
				});
			expect(response1.statusCode).toBe(302);

			const response2 = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/add-document-details`)
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
				`${baseUrl}/2/rule-6-party-statement/1/add-document/check-your-answers`
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
				`<a class="govuk-link" href="/appeals-service/appeal-details/2/rule-6-party-statement/1/add-document">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/2/rule-6-party-statement/1/add-document/add-document-details">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /add-document/check-your-answers', () => {
		it('should call the API to add document and redirect to rule 6 party statement page', async () => {
			await request.post(`${baseUrl}/2/rule-6-party-statement/1/add-document`).send({
				'upload-info': fileUploadInfo
			});

			await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/add-document-details`)
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

			const mockedPostRepresentationEndpoint = nock('http://test/')
				.post('/appeals/2/reps/rule_6_party_statement')
				.reply(200, {
					attachments: ['1']
				});

			const response = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/check-your-answers`)
				.send({});

			expect(mockedPostRepresentationEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/2/rule-6-party-statement/1`
			);

			repsResponse = {
				items: [
					{
						id: 1,
						status: 'awaiting_review',
						author: 'Test Rule 6 Party',
						represented: {
							id: 100
						},
						attachments: [
							{
								documentVersion: {
									document: {
										caseId: 2,
										guid: '1',
										name: 'test-document.txt'
									}
								},
								version: 1
							}
						]
					}
				],
				itemCount: 1
			};

			const responseFromRedirect = await request.get(
				'/appeals-service/appeal-details/2/rule-6-party-statement/1'
			);

			const notificationBannerHtml = parseHtml(responseFromRedirect.text, {
				rootElement: '.govuk-notification-banner--success',
				skipPrettyPrint: true
			}).innerHTML;

			expect(notificationBannerHtml).toContain('Success</h3>');
			expect(notificationBannerHtml).toContain('Test Rule 6 Party statement added</p>');
		});
	});
});

describe('rule 6 party statement review - allocation', () => {
	const appealId = 2;
	const rule6PartyId = 1;
	const flowRoute = 'valid';

	beforeEach(() => {
		installMockApi();

		nock('http://test/')
			.get(`/appeals/${appealId}?include=all`)
			.reply(200, {
				...appealDataFullPlanning,
				appealId,
				procedureType: 'inquiry',
				appealStatus: 'statements',
				appealRule6Parties: [
					{
						id: rule6PartyId,
						serviceUserId: 100,
						partyName: 'Test Rule 6 Party'
					}
				]
			})
			.persist();

		nock('http://test/')
			.get(`/appeals/${appealId}/reps?type=rule_6_party_statement`)
			.reply(200, {
				...getAppealRepsResponse,
				itemCount: 1,
				items: [
					{
						id: 3670,
						status: 'awaiting_review',
						author: 'Test Rule 6 Party',
						represented: { id: 100 }
					}
				]
			})
			.persist();

		nock('http://test/')
			.get('/appeals/appeal-allocation-levels')
			.reply(200, allocationDetailsData.levels)
			.persist();

		nock('http://test/')
			.get('/appeals/appeal-allocation-specialisms')
			.reply(200, allocationDetailsData.specialisms)
			.persist();
	});

	afterEach(teardown);

	describe('allocation pages', () => {
		describe('GET /allocation-check', () => {
			it('should render allocation-check page', async () => {
				const response = await request.get(
					`${baseUrl}/${appealId}/rule-6-party-statement/${rule6PartyId}/${flowRoute}/allocation-check`
				);
				expect(response.statusCode).toBe(200);
				expect(response.text).toContain(
					'Do you need to update the allocation level and specialisms?'
				);
			});
		});

		describe('POST /allocation-check', () => {
			it('should redirect to allocation-level if answer is yes', async () => {
				const response = await request
					.post(
						`${baseUrl}/${appealId}/rule-6-party-statement/${rule6PartyId}/${flowRoute}/allocation-check`
					)
					.send({ allocationLevelAndSpecialisms: 'yes' });
				expect(response.statusCode).toBe(302);
				expect(response.text).toContain('allocation-level');
			});

			it('should redirect to confirm if answer is no', async () => {
				const response = await request
					.post(
						`${baseUrl}/${appealId}/rule-6-party-statement/${rule6PartyId}/${flowRoute}/allocation-check`
					)
					.send({ allocationLevelAndSpecialisms: 'no' });
				expect(response.statusCode).toBe(302);
				expect(response.text).toContain(`${flowRoute}/confirm`);
			});
		});

		describe('GET /allocation-level', () => {
			it('should render allocation-level page', async () => {
				const response = await request.get(
					`${baseUrl}/${appealId}/rule-6-party-statement/${rule6PartyId}/${flowRoute}/allocation-level`
				);
				expect(response.statusCode).toBe(200);
				expect(response.text).toContain('Allocation level');
			});
		});

		describe('POST /allocation-level', () => {
			it('should redirect to allocation-specialisms', async () => {
				const response = await request
					.post(
						`${baseUrl}/${appealId}/rule-6-party-statement/${rule6PartyId}/${flowRoute}/allocation-level`
					)
					.send({ allocationLevel: 'A' });
				expect(response.statusCode).toBe(302);
				expect(response.text).toContain('allocation-specialisms');
			});
		});

		describe('GET /allocation-specialisms', () => {
			it('should render allocation-specialisms page', async () => {
				const response = await request.get(
					`${baseUrl}/${appealId}/rule-6-party-statement/${rule6PartyId}/${flowRoute}/allocation-specialisms`
				);
				expect(response.statusCode).toBe(200);
				expect(response.text).toContain('Allocation specialisms');
			});
		});

		describe('POST /allocation-specialisms', () => {
			it('should redirect to confirm', async () => {
				const response = await request
					.post(
						`${baseUrl}/${appealId}/rule-6-party-statement/${rule6PartyId}/${flowRoute}/allocation-specialisms`
					)
					.send({ allocationSpecialisms: ['1'] });
				expect(response.statusCode).toBe(302);
				expect(response.text).toContain(`${flowRoute}/confirm`);
			});
		});
	});
});
