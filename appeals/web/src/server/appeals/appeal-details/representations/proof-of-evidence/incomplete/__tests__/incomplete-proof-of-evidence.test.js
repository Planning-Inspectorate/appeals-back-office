/* eslint-disable jest/expect-expect */
import {
	appealDataFullPlanning,
	proofOfEvidenceForReviewWithAttachments,
	representationRejectionReasons
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('incomplete proof of evidence', () => {
	beforeEach(() => {
		installMockApi();

		nock('http://test/')
			.get('/appeals/2')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				appealStatus: 'appellant_proofs_evidence'
			})
			.persist();
		nock('http://test')
			.get('/appeals/representation-rejection-reasons?type=appellant_proofs_evidence')
			.reply(200, representationRejectionReasons)
			.persist();
		nock('http://test')
			.get('/appeals/representation-rejection-reasons?type=lpa_proofs_evidence')
			.reply(200, representationRejectionReasons)
			.persist();
		nock('http://test/')
			.get(`/appeals/2/reps?type=appellant_proofs_evidence`)
			.reply(200, proofOfEvidenceForReviewWithAttachments)
			.persist();
		nock('http://test/')
			.get(`/appeals/2/reps?type=lpa_proofs_evidence`)
			.reply(200, proofOfEvidenceForReviewWithAttachments)
			.persist();
	});

	afterEach(teardown);

	describe('GET /', () => {
		it('should redirect to the incomplete reasons page', async () => {
			await request
				.get(`${baseUrl}/2/proof-of-evidence/appellant/incomplete`)
				.expect(302)
				.expect(
					'Location',
					'/appeals-service/appeal-details/2/proof-of-evidence/appellant/incomplete/reasons'
				);
		});
	});

	describe('GET /reasons', () => {
		it(`should render the incomplete appellant proof of evidence page with the expected content`, async () => {
			nock('http://test/')
				.get(`/appeals/2/reps?type=appellant_proofs_evidence`)
				.reply(200, proofOfEvidenceForReviewWithAttachments)
				.persist();

			const response = await request.get(
				`${baseUrl}/2/proof-of-evidence/appellant/incomplete/reasons`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const pageHtml = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			});

			expect(pageHtml.querySelector('h1')?.innerHTML?.trim()).toBe(
				'Why are the proof of evidence and witnesses incomplete?'
			);
			expect(pageHtml.querySelector('a.govuk-back-link')?.getAttribute('href')).toContain(
				'/appeals-service/appeal-details/2/proof-of-evidence/appellant'
			);
			expect(pageHtml.querySelector('button.pins-add-another__add-button')?.textContent).toContain(
				'Add another'
			);
			expect(pageHtml.querySelector('button.govuk-button[type="submit"]')?.textContent).toContain(
				'Continue'
			);
		});
	});
});
