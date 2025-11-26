/* eslint-disable jest/expect-expect */
import {
	appealDataFullPlanning,
	documentRedactionStatuses,
	fileUploadInfo,
	proofOfEvidenceForReviewWithAttachments
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('add representation', () => {
	beforeEach(() => {
		installMockApi();

		nock('http://test/')
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				procedureType: 'inquiry',
				appealStatus: 'statements'
			})
			.persist();

		nock('http://test/')
			.get('/appeals/2/document-folders?path=representation/representationAttachments')
			.reply(200, [{ folderId: 1234, path: 'representation/attachments' }])
			.persist();

		nock('http://test/')
			.get(`/appeals/2/reps?type=lpa_proofs_evidence`)
			.reply(200, proofOfEvidenceForReviewWithAttachments)
			.persist();

		nock('http://test/')
			.get(`/appeals/2/reps?type=appellant_proofs_evidence`)
			.reply(200, proofOfEvidenceForReviewWithAttachments)
			.persist();

		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses)
			.persist();
	});

	afterEach(teardown);

	const proofOfEvidenceTypes = [
		{
			type: 'appellant',
			label: 'appellant'
		},
		{
			type: 'lpa',
			label: 'LPA'
		}
	];

	describe('GET /', () => {
		for (const proofOfEvidenceType of proofOfEvidenceTypes) {
			it(`should render the add representation ${proofOfEvidenceType.type} proof of evidence page with the expected content`, async () => {
				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-representation`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedHTML = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: 'body'
				}).innerHTML;

				expect(unprettifiedHTML).toContain(
					`/appeals-service/appeal-details/2" class="govuk-back-link">Back</a>`
				);
				expect(unprettifiedHTML).toContain(
					`<h1 class="govuk-heading-l">Proof of evidence and witnesses</h1>`
				);
				expect(unprettifiedHTML).toContain('Proof of evidence and witnesses</span>');
				expect(unprettifiedHTML).toContain('Upload proof of evidence and witnesses</h2>');
			});

			it(`should render the add representation ${proofOfEvidenceType.type} proof of evidence page with correct back button link`, async () => {
				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-representation?backUrl=/appeals-service/appeal-details/2`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedHTML = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: 'body'
				}).innerHTML;

				expect(unprettifiedHTML).toContain(
					`/appeals-service/appeal-details/2" class="govuk-back-link">Back</a>`
				);
			});
		}
	});

	describe('POST /', () => {
		for (const proofOfEvidenceType of proofOfEvidenceTypes) {
			it(`should redirect to the check your answers page page`, async () => {
				nock('http://test/')
					.get(`/appeals/2/reps?type=${proofOfEvidenceType.type}_proofs_evidence`)
					.reply(200, proofOfEvidenceForReviewWithAttachments)
					.persist();

				const response = await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-representation`)
					.send({
						'upload-info': fileUploadInfo
					});
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/add-representation/check-your-answers`
				);
			});
		}
	});

	describe('GET /check-your-answers', () => {
		for (const proofOfEvidenceType of proofOfEvidenceTypes) {
			it(`should render the check your answers page with the expected content for type (${proofOfEvidenceType.type})`, async () => {
				const representationUpload = await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-representation`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(representationUpload.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-representation/check-your-answers`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: 'body'
				}).innerHTML;

				expect(unprettifiedHTML).toContain(
					`Add ${
						proofOfEvidenceType.type === 'lpa' ? 'LPA' : 'appellant'
					} proof of evidence and witnesses</button>`
				);
				expect(unprettifiedHTML).toContain('Appeal 351062</span>');
				expect(unprettifiedHTML).toContain(
					`Check details and add ${
						proofOfEvidenceType.type === 'lpa' ? 'LPA' : 'appellant'
					} proof of evidence and witnesses</h1>`
				);
				expect(unprettifiedHTML).toContain('Proof of evidence and witnesses</dt>');
				expect(unprettifiedHTML).toContain(`test-document.txt</a>`);
				expect(unprettifiedHTML).toContain(
					`href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/add-representation?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fproof-of-evidence%2F${proofOfEvidenceType.type}%2Fadd-representation">Change`
				);
				expect(unprettifiedHTML).toContain(
					`Change <span class="govuk-visually-hidden">proof of evidence and witnesses</span></a>`
				);
				expect(unprettifiedHTML).toContain(
					`<a href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/add-representation" class="govuk-back-link">Back</a>`
				);
			});
		}
	});

	describe('POST /check-your-answers', () => {
		for (const proofOfEvidenceType of proofOfEvidenceTypes) {
			it(`should call the post representation endpoint to create new (${proofOfEvidenceType.type} proof of evidence representation)`, async () => {
				const representationUpload = await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-representation`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(representationUpload.statusCode).toBe(302);

				const mockedPostRepresentationEndpoint = nock('http://test/')
					.post(`/appeals/2/reps/${proofOfEvidenceType.type}/proof-of-evidence`)
					.reply(200, {
						attachments: ['1']
					});

				const documentUpload = nock('http://test/')
					.post('/appeals/2/documents', () => true)
					.reply(200, { success: true });

				const response = await request
					.post(
						`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/add-representation/check-your-answers`
					)
					.send({});

				expect(mockedPostRepresentationEndpoint.isDone()).toBe(true);
				expect(documentUpload.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}`
				);
			});
		}
	});
});
