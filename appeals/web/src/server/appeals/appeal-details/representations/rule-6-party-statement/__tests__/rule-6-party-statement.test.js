import {
	appealDataFullPlanning,
	documentRedactionStatuses,
	fileUploadInfo
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

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
						partyName: 'Test Rule 6 Party'
					}
				],
				rule6PartyId: 1
			})
			.persist();

		nock('http://test/')
			.get('/appeals/2/document-folders?path=representation/representationAttachments')
			.reply(200, [{ folderId: 1234, path: 'representation/attachments' }])
			.persist();

		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses)
			.persist();

		nock('http://test/').post('/appeals/2/documents').reply(200, {}).persist();

		nock('http://test/').patch('/appeals/2/reps/3670/attachments').reply(200, {}).persist();
		nock('http://test/')
			.get('/appeals/2/reps?type=rule_6_party_statement')
			.reply(200, { items: [], itemCount: 0 })
			.persist();
	});

	afterEach(teardown);

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
		it('should redirect to the redaction status page after document upload', async () => {
			const response = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/2/rule-6-party-statement/1/add-document/redaction-status`
			);
		});
	});

	describe('GET /add-document/redaction-status', () => {
		it('should render the redaction status page', async () => {
			const response = await request.get(
				`${baseUrl}/2/rule-6-party-statement/1/add-document/redaction-status`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('Redaction status</h1>');
		});
	});

	describe('POST /add-document/redaction-status', () => {
		it('should redirect to the date submitted page after selecting redaction status', async () => {
			const response = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/redaction-status`)
				.send({
					redactionStatus: 'no_redaction_required'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/2/rule-6-party-statement/1/add-document/date-submitted`
			);
		});
	});

	describe('GET /add-document/date-submitted', () => {
		it('should render the date submitted page', async () => {
			const response = await request.get(
				`${baseUrl}/2/rule-6-party-statement/1/add-document/date-submitted`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('When was the supporting document submitted?</h1>');
		});
	});

	describe('POST /add-document/date-submitted', () => {
		it('should redirect to the check your answers page after entering a valid date', async () => {
			const response = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/date-submitted`)
				.send({
					'date-day': '15',
					'date-month': '12',
					'date-year': '2024'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/2/rule-6-party-statement/1/add-document/check-your-answers`
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
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/redaction-status`)
				.send({
					redactionStatus: 'no_redaction_required'
				});
			expect(response2.statusCode).toBe(302);

			const response3 = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/date-submitted`)
				.send({
					'date-day': '15',
					'date-month': '12',
					'date-year': '2024'
				});
			expect(response3.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/2/rule-6-party-statement/1/add-document/check-your-answers`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('Check details and add document</h1>');
			expect(unprettifiedHTML).toContain('Appeal 351062</span>');
			expect(unprettifiedHTML).toContain('test-document.txt</a>');
			expect(unprettifiedHTML).toContain('Redaction status</dt>');
			expect(unprettifiedHTML).toContain('Date submitted</dt>');
		});
	});

	describe('POST /add-document/check-your-answers', () => {
		it('should call the API to add document and redirect to rule 6 party statement page', async () => {
			await request.post(`${baseUrl}/2/rule-6-party-statement/1/add-document`).send({
				'upload-info': fileUploadInfo
			});

			await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/redaction-status`)
				.send({
					redactionStatus: 'no_redaction_required'
				});

			await request.post(`${baseUrl}/2/rule-6-party-statement/1/add-document/date-submitted`).send({
				'date-day': '15',
				'date-month': '12',
				'date-year': '2024'
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
		});
	});
});
