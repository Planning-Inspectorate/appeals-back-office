/* eslint-disable jest/expect-expect */
import {
	appealDataFullPlanning,
	lpaProofOfEvidenceIncompleteReasons,
	proofOfEvidenceForReviewWithAttachments
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const incompleteReasons = [
	{
		name: 'Not complete',
		representationType: 'lpa_proofs_evidence',
		hasText: false
	},
	{
		name: 'Not relevant',
		representationType: 'lpa_proofs_evidence',
		hasText: false
	},
	{
		name: 'Other reason',
		representationType: 'lpa_proofs_evidence',
		hasText: true
	}
];

describe('proof-of-evidence', () => {
	installMockApi();

	describe('GET /', () => {
		beforeEach(() => {
			installMockApi();
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2,
					appealStatus: 'appellant_proofs_evidence'
				})
				.persist();

			nock('http://test')
				.get('/appeals/representation-rejection-reasons?type=lpa_proofs_evidence')
				.reply(200, lpaProofOfEvidenceIncompleteReasons)
				.persist();

			nock('http://test/')
				.get(`/appeals/2/reps?type=lpa_proofs_evidence`)
				.reply(200, proofOfEvidenceForReviewWithAttachments)
				.persist();
		});

		afterEach(teardown);

		it(`should render the incomplete LPA proof of evidence reasons page with the expected content`, async () => {
			const response = await request.get(`${baseUrl}/2/proof-of-evidence/lpa/incomplete/reasons`);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain(incompleteReasons[0].name);
			expect(unprettifiedHTML).toContain(incompleteReasons[1].name);
			expect(unprettifiedHTML).toContain(incompleteReasons[2].name);
		});
	});
});
