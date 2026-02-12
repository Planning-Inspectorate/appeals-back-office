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
			.get('/appeals/2/document-folders/1234')
			.query(true)
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

		nock('http://test/').post('/appeals/2/documents').reply(200, {}).persist();

		nock('http://test/')
			.get('/appeals/2/reps?type=rule_6_party_proofs_evidence')
			.reply(200, { items: [], itemCount: 0 })
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
		it('should redirect to the redaction status page after document upload', async () => {
			const response = await request.post(flowBaseUrl).send({
				'upload-info': fileUploadInfo
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(`Found. Redirecting to ${flowBaseUrl}/redaction-status`);
		});
	});

	describe('GET /add-representation/redaction-status', () => {
		it('should render the redaction status page', async () => {
			const response = await request.get(`${flowBaseUrl}/redaction-status`);

			expect(response.statusCode).toBe(200);

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('Redaction status</h1>');
		});
	});

	describe('POST /add-representation/redaction-status', () => {
		it('should redirect to the date submitted page after selecting redaction status', async () => {
			const response = await request.post(`${flowBaseUrl}/redaction-status`).send({
				redactionStatus: 'no_redaction_required'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(`Found. Redirecting to ${flowBaseUrl}/date-submitted`);
		});
	});

	describe('GET /add-representation/date-submitted', () => {
		it('should render the date submitted page', async () => {
			const response = await request.get(`${flowBaseUrl}/date-submitted`);

			expect(response.statusCode).toBe(200);

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('Received date</h1>');
		});
	});

	describe('POST /add-representation/date-submitted', () => {
		it('should redirect to the check your answers page after entering a valid date', async () => {
			const response = await request.post(`${flowBaseUrl}/date-submitted`).send({
				'date-day': '15',
				'date-month': '12',
				'date-year': '2024'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(`Found. Redirecting to ${flowBaseUrl}/check-your-answers`);
		});
	});

	describe('GET /add-representation/check-your-answers', () => {
		it('should render the check your answers page with the expected content', async () => {
			await request.post(flowBaseUrl).send({ 'upload-info': fileUploadInfo });
			await request
				.post(`${flowBaseUrl}/redaction-status`)
				.send({ redactionStatus: 'no_redaction_required' });
			await request
				.post(`${flowBaseUrl}/date-submitted`)
				.send({ 'date-day': '15', 'date-month': '12', 'date-year': '2024' });

			const response = await request.get(`${flowBaseUrl}/check-your-answers`);

			expect(response.statusCode).toBe(200);

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain(
				'Check details and add Test Rule 6 Party proof of evidence and witnesses</h1>'
			);
			expect(unprettifiedHTML).toContain('Appeal 351062</span>');
			expect(unprettifiedHTML).toContain('test-document.txt</a>');
			expect(unprettifiedHTML).toContain('Redaction status</dt>');
			expect(unprettifiedHTML).toContain('Date received</dt>');
		});
	});

	describe('POST /add-representation/check-your-answers', () => {
		it('should call the API to add document and redirect to rule 6 party managed documents page', async () => {
			await request.post(flowBaseUrl).send({ 'upload-info': fileUploadInfo });
			await request
				.post(`${flowBaseUrl}/redaction-status`)
				.send({ redactionStatus: 'no_redaction_required' });
			await request
				.post(`${flowBaseUrl}/date-submitted`)
				.send({ 'date-day': '15', 'date-month': '12', 'date-year': '2024' });

			const mockedPostRepresentationEndpoint = nock('http://test/')
				.post('/appeals/2/reps/rule_6_party_proofs_evidence')
				.reply(200, {
					attachments: ['1']
				});

			const response = await request.post(`${flowBaseUrl}/check-your-answers`).send({});

			expect(mockedPostRepresentationEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/2/proof-of-evidence/rule-6-party/1/manage-documents/1234`
			);

			nock('http://test/')
				.get('/appeals/2/reps?type=rule_6_party_proofs_evidence')
				.reply(200, {
					itemCount: 1,
					items: [
						{
							id: 1,
							status: 'valid',
							representationType: 'rule_6_party_proofs_evidence',
							represented: { id: 100 },
							attachments: [
								{
									id: 1,
									documentGuid: '1'
								}
							]
						}
					]
				})
				.persist();

			const responseFromRedirect = await request.get(
				'/appeals-service/appeal-details/2/proof-of-evidence/rule-6-party/1/manage-documents/1234'
			);

			const notificationBannerHtml = parseHtml(responseFromRedirect.text, {
				rootElement: '.govuk-notification-banner--success',
				skipPrettyPrint: true
			}).innerHTML;

			expect(notificationBannerHtml).toContain('Success</h3>');
			expect(notificationBannerHtml).toContain(
				'Test Rule 6 Party proof of evidence and witnesses added</p>'
			);
		});
	});
});
