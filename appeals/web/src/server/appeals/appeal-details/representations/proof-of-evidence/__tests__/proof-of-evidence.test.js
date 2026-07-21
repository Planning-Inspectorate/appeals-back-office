import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	appealDataFullPlanning,
	costsFolderInfoAppellantApplication,
	documentFileInfo,
	documentRedactionStatuses,
	fileUploadInfo,
	proofOfEvidenceForReview,
	proofOfEvidenceForReviewWithAttachments
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('proof-of-evidence', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});
	const proofOfEvidenceTypes = [
		{
			type: 'appellant',
			label: 'Appellant'
		},
		{
			type: 'lpa',
			label: 'LPA'
		}
	];

	beforeEach(() => {
		installMockApi();
		// Common nock setup
		nock('http://test/')
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				appealStatus: 'statements'
			})
			.persist();

		nock('http://test/')
			.get('/appeals/2/reps?type=lpa_proofs_evidence')
			.reply(200, proofOfEvidenceForReviewWithAttachments)
			.persist();

		nock('http://test/')
			.get('/appeals/2/document-folders?path=representation/representationAttachments')
			.reply(200, [{ folderId: 1234, path: 'representation/representationAttachments' }])
			.persist();

		nock('http://test/')
			.get('/appeals/2/reps/5')
			.reply(200, proofOfEvidenceForReviewWithAttachments)
			.persist();

		nock('http://test/')
			.get('/appeals/2/document-folders/1?pageNumber=1&pageSize=100&repId=3670')
			.reply(200, costsFolderInfoAppellantApplication)
			.persist();

		nock('http://test/').get('/appeals/2/documents/1').reply(200, documentFileInfo).persist();

		nock('http://test/')
			.get(`/appeals/2/reps?type=lpa_proofs_evidence`)
			.reply(200, proofOfEvidenceForReview)
			.persist();

		nock('http://test/')
			.get(`/appeals/2/reps?type=appellant_proofs_evidence`)
			.reply(200, proofOfEvidenceForReview)
			.persist();

		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses)
			.persist();

		nock('http://test/').post('/appeals/2/documents').reply(200, {}).persist();

		nock('http://test/').patch('/appeals/2/reps/3670/attachments').reply(200, {}).persist();
	});

	afterEach(teardown);

	for (const proofOfEvidenceType of proofOfEvidenceTypes) {
		describe(`GET /add-document for ${proofOfEvidenceType.type}`, () => {
			it(`should render add document page with correct content for ${proofOfEvidenceType.type}`, async () => {
				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document`
				);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span');
				expect(unprettifiedElement.innerHTML).toContain(
					`Upload new proof of evidence and witnesses document</h1>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`data-next-page-url="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details"`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'data-document-title="proof of evidence and witnesses document"'
				);
			});
		});

		describe(`POST /add-document for ${proofOfEvidenceType.type}`, () => {
			it(`should redirect to add document details for ${proofOfEvidenceType.type}`, async () => {
				const response = await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);

				expect(response.text).toBe(
					`Found. Redirecting to ${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details`
				);
			});
		});

		describe(`GET /add-document/add-document-details for ${proofOfEvidenceType.type}`, () => {
			it(`should render 500 if no fileUploadInfo previously submitted`, async () => {
				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details`
				);

				expect(response.statusCode).toBe(500);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Sorry, there is a problem with the service</h1>'
				);
			});
		});

		describe(`GET /add-document/add-document-details for ${proofOfEvidenceType.type}`, () => {
			it(`should render add document details page with correct content for ${proofOfEvidenceType.type}`, async () => {
				await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document`)
					.send({
						'upload-info': fileUploadInfo
					});

				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span');
				expect(unprettifiedElement.innerHTML).toContain(
					`Upload new proof of evidence and witnesses document</h1>`
				);
			});
		});

		describe(`POST /add-document/add-document-details for ${proofOfEvidenceType.type}`, () => {
			beforeEach(async () => {
				await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document`)
					.send({
						'upload-info': fileUploadInfo
					});
			});

			it(`should re-render add documents details page if the request body is in an incorrect format for ${proofOfEvidenceType.type}`, async () => {
				const response = await request
					.post(
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details`
					)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value for ${proofOfEvidenceType.type}`, async () => {
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
						.post(
							`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details`
						)
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
					expect(unprettifiedElement.innerHTML).toContain(
						`Representation attachment documents</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value for ${proofOfEvidenceType.type}`, async () => {
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
						.post(
							`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details`
						)
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
					expect(unprettifiedElement.innerHTML).toContain(
						`Representation attachment documents</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value for ${proofOfEvidenceType.type}`, async () => {
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
						.post(
							`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details`
						)
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
					expect(unprettifiedElement.innerHTML).toContain(
						`Representation attachment documents</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render add documents details page if receivedDate is not a valid date for ${proofOfEvidenceType.type}`, async () => {
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
						.post(
							`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details`
						)
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
					expect(unprettifiedElement.innerHTML).toContain(
						`Representation attachment documents</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should redirect to check your answers for ${proofOfEvidenceType.type}`, async () => {
				const response = await request
					.post(
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details`
					)
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
					`Found. Redirecting to ${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/check-your-answers`
				);
			});
		});

		describe(`GET /add-document/check-your-answers for ${proofOfEvidenceType.type}`, () => {
			it(`should render check your answers page with correct content for ${proofOfEvidenceType.type}`, async () => {
				const response1 = await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document`)
					.send({
						'upload-info': fileUploadInfo
					});
				expect(response1.statusCode).toBe(302);

				const response2 = await request
					.post(
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details`
					)
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
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/check-your-answers`
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
					`<a class="govuk-link" href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
				expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
			});
		});

		describe(`POST /add-document/check-your-answers for ${proofOfEvidenceType.type}`, () => {
			it(`should redirect to review representations page for ${proofOfEvidenceType.type}`, async () => {
				await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document`)
					.send({
						'upload-info': fileUploadInfo
					});

				await request
					.post(
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/add-document-details`
					)
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
					.post(
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/check-your-answers`
					)
					.send({});

				expect(response.statusCode).toBe(302);

				expect(response.text).toBe(
					`Found. Redirecting to ${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/manage-documents/1234`
				);
			});
		});
	}
});
