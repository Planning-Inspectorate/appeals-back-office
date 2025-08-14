/* eslint-disable jest/expect-expect */
import {
	appealDataFullPlanning,
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

		nock('http://test/')
			.get('/appeals/2')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				appealStatus: 'appellant_proofs_evidence'
			})
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
			it(`should render the accept ${proofOfEvidenceType.type} proof of evidence page with the expected content`, async () => {
				nock('http://test/')
					.get(`/appeals/2/reps?type=${proofOfEvidenceType.type}_proofs_evidence`)
					.reply(200, proofOfEvidenceForReviewWithAttachments)
					.persist();

				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/accept`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedHTML = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: 'body'
				}).innerHTML;

				expect(unprettifiedHTML).toContain(
					`<a href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}" class="govuk-back-link">Back</a>`
				);
				expect(unprettifiedHTML).toContain('Appeal 351062</span>');
				expect(unprettifiedHTML).toContain(
					`Check details and accept ${proofOfEvidenceType.label} proof of evidence and witnesses</h1>`
				);
				expect(unprettifiedHTML).toContain('Proof of evidence and witnesses</dt>');
				expect(unprettifiedHTML).toContain(
					`href="/documents/4881/download/ed52cdc1-3cc2-462a-8623-c1ae256969d6/blank copy 5.pdf" target="_blank">blank copy 5.pdf</a>`
				);
				expect(unprettifiedHTML).toContain('Review decisions</dt>');
				expect(unprettifiedHTML).toContain('Accept proof of evidence and witnesses</dd>');
				expect(unprettifiedHTML).toContain(
					`href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}`
				);
				expect(unprettifiedHTML).toContain(
					`Accept ${proofOfEvidenceType.label} proof of evidence and witnesses</button>`
				);
				expect(unprettifiedHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/change/135568/?backUrl=/proof-of-evidence/${proofOfEvidenceType.type}/accept">Change<span class="govuk-visually-hidden"> proof of evidence and witnesses</span></a>`
				);
				expect(unprettifiedHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}?backUrl=/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/accept">Change</a>`
				);
			});
		}
	});
});
