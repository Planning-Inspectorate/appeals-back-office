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
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('proof-of-evidence', () => {
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
			.reply(200, [{ folderId: 1234, path: 'representation/attachments' }])
			.persist();

		nock('http://test/')
			.get('/appeals/2/reps/5')
			.reply(200, proofOfEvidenceForReviewWithAttachments)
			.persist();

		nock('http://test/')
			.get('/appeals/2/document-folders/1?repId=3670')
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
					`data-next-page-url="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/redaction-status"`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'data-document-title="proof of evidence and witnesses document"'
				);
			});
		});

		describe(`POST /add-document for ${proofOfEvidenceType.type}`, () => {
			it(`should redirect to redacted status for ${proofOfEvidenceType.type}`, async () => {
				const response = await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);

				expect(response.text).toBe(
					`Found. Redirecting to ${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/redaction-status`
				);
			});
		});

		describe(`GET /add-document/redacted-status for ${proofOfEvidenceType.type}`, () => {
			it(`should render redaction status page with correct content for ${proofOfEvidenceType.type}`, async () => {
				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/redaction-status`
				);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span');
				expect(unprettifiedElement.innerHTML).toContain(`Redaction status</h1>`);
			});
		});

		describe(`POST /add-document/redacted-status for ${proofOfEvidenceType.type}`, () => {
			it(`should redirect to redacted status for ${proofOfEvidenceType.type}`, async () => {
				const response = await request
					.post(
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/redaction-status`
					)
					.send({
						redactionStatus: 'no_redaction_required'
					});

				expect(response.statusCode).toBe(302);

				expect(response.text).toBe(
					`Found. Redirecting to ${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/date-submitted`
				);
			});
		});

		describe(`GET /add-document/date-submitted for ${proofOfEvidenceType.type}`, () => {
			it(`should render date submitted page with correct content for ${proofOfEvidenceType.type}`, async () => {
				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/date-submitted`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span');
				expect(unprettifiedElement.innerHTML).toContain(`Received date</h1>`);
			});
		});

		describe(`POST /add-document/date-submitted for ${proofOfEvidenceType.type}`, () => {
			it(`should redirect to redacted status for ${proofOfEvidenceType.type}`, async () => {
				const response = await request
					.post(
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/date-submitted`
					)
					.send({
						'date-day': '20',
						'date-month': '09',
						'date-year': '2025'
					});

				expect(response.statusCode).toBe(302);

				expect(response.text).toBe(
					`Found. Redirecting to ${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/check-your-answers`
				);
			});
		});

		describe(`GET /add-document/check-your-answers for ${proofOfEvidenceType.type}`, () => {
			it(`should render date submitted page with correct content for ${proofOfEvidenceType.type}`, async () => {
				const response1 = await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document`)
					.send({
						'upload-info': fileUploadInfo
					});
				expect(response1.statusCode).toBe(302);

				const response2 = await request
					.post(
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/redaction-status`
					)
					.send({
						redactionStatus: 'no_redaction_required'
					});
				expect(response2.statusCode).toBe(302);

				const response3 = await request
					.post(
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/date-submitted`
					)
					.send({
						'date-day': '20',
						'date-month': '09',
						'date-year': '2025'
					});
				expect(response3.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/check-your-answers`
				);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span');
				expect(unprettifiedElement.innerHTML).toContain(
					`Check details and add ${
						proofOfEvidenceType.type === 'lpa'
							? 'LPA'
							: proofOfEvidenceType.type === 'appellant'
								? 'appellant'
								: 'rule 6 party'
					} proof of evidence and witnesses</h1>`
				);
				expect(unprettifiedElement.innerHTML).toContain(`Redaction status</dt>`);
				expect(unprettifiedElement.innerHTML).toContain(`Proof of evidence and witnesses</dt>`);
				expect(unprettifiedElement.innerHTML).toContain(`Date received</dt>`);
				expect(unprettifiedElement.innerHTML).toContain(
					`Add ${
						proofOfEvidenceType.type === 'lpa'
							? 'LPA'
							: proofOfEvidenceType.type === 'appellant'
								? 'appellant'
								: 'rule 6 party'
					} proof of evidence and witnesses</button>`
				);
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
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/redaction-status`
					)
					.send({
						redactionStatus: 'no_redaction_required'
					});

				await request
					.post(
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-document/date-submitted`
					)
					.send({
						'date-day': '20',
						'date-month': '09',
						'date-year': '2025'
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
