import {
	appealDataFullPlanning,
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
	beforeEach(() => {
		installMockApi();
		// Common nock setup
		nock('http://test/')
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				appealStatus: 'statements'
			});

		nock('http://test/')
			.get('/appeals/2/reps?type=lpa_proofs_evidence')
			.reply(200, proofOfEvidenceForReviewWithAttachments)
			.persist();

		nock('http://test/')
			.get('/appeals/2/document-folders?path=representation/representationAttachments')
			.reply(200, [{ folderId: 1234, path: 'representation/attachments' }]);
	});

	afterEach(teardown);

	describe('GET /review-proof-of-evidence with data', () => {
		it('should render review LPA proof of evidence page with the provided proof of evidence details', async () => {
			const response = await request.get(`${baseUrl}/2/proof-of-evidence/lpa`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const elementInnerHtml = dom.innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Review LPA proof of evidence and witnesses</h1>');

			const proofOfEvidenceRow = parseHtml(response.text, {
				rootElement: '.govuk-summary-list__row:first-of-type'
			});

			expect(proofOfEvidenceRow).not.toBeNull();
			const partyKey = proofOfEvidenceRow?.querySelector('.govuk-summary-list__key');
			const proofOfEvidenceValue = proofOfEvidenceRow?.querySelector('.govuk-summary-list__value');
			expect(partyKey?.textContent?.trim()).toBe('Proof of evidence and witnesses');
			expect(proofOfEvidenceValue?.textContent?.trim()).toBe('blank copy 5.pdf');
		});

		it('should render review appellant proof of evidence page with the provided details', async () => {
			nock('http://test/')
				.get('/appeals/2/reps?type=appellant_proofs_evidence')
				.reply(200, proofOfEvidenceForReview);
			const response = await request.get(`${baseUrl}/2/proof-of-evidence/appellant`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const elementInnerHtml = dom.innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Review appellant proof of evidence and witnesses</h1>');

			const proofOfEvidenceRow = parseHtml(response.text, {
				rootElement: '.govuk-summary-list__row:first-of-type'
			});

			expect(proofOfEvidenceRow).not.toBeNull();
			const partyKey = proofOfEvidenceRow?.querySelector('.govuk-summary-list__key');
			const proofOfEvidenceValue = proofOfEvidenceRow?.querySelector('.govuk-summary-list__value');
			expect(partyKey?.textContent?.trim()).toBe('Proof of evidence and witnesses');
			expect(proofOfEvidenceValue?.textContent?.trim()).toBe('No documents');
		});
	});

	describe('POST /review-proof-of-evidence with data', () => {
		it('should render review LPA proof of evidence page with error if no option is selected', async () => {
			const response = await request.post(`${baseUrl}/2/proof-of-evidence/lpa`).send({
				status: ''
			});
			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const elementInnerHtml = dom.innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('There is a problem</h2>');
			expect(elementInnerHtml).toContain('Review decision must be provided</a>');
		});
	});

	describe('GET /review-proof-of-evidence with no data', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/proof-of-evidence/999').reply(404, {});
		});

		it('should render 404 page when the proof of evidence is not found', async () => {
			const response = await request.get(`${baseUrl}/2/review/999`);

			expect(response.statusCode).toBe(404);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toContain('Page not found');
		});
	});
});
