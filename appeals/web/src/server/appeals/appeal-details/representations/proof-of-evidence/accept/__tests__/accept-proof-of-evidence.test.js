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
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				appealStatus: 'appellant_proofs_evidence',
				appealRule6Parties: [
					{
						id: 3670,
						serviceUserId: 3838,
						partyName: 'Test Rule 6 Party',
						serviceUser: {
							organisationName: 'Test Rule 6 Party'
						}
					}
				],
				rule6PartyId: 3670
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
		},
		{
			type: 'rule-6-party',
			label: 'Test Rule 6 Party'
		}
	];

	describe('GET /', () => {
		for (const proofOfEvidenceType of proofOfEvidenceTypes) {
			it(`should render the accept ${proofOfEvidenceType.type} proof of evidence page with the expected content`, async () => {
				const proofType = proofOfEvidenceType.type.replaceAll('-', '_');
				nock('http://test/')
					.get(`/appeals/2/reps?type=${proofType}_proofs_evidence`)
					.reply(200, proofOfEvidenceForReviewWithAttachments)
					.persist();

				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}${
						proofOfEvidenceType.type === 'rule-6-party' ? '/3670' : ''
					}/accept`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedHTML = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: 'body'
				}).innerHTML;

				expect(unprettifiedHTML).toContain(
					`<a href="/appeals-service/appeal-details/2/proof-of-evidence/${
						proofOfEvidenceType.type
					}${
						proofOfEvidenceType.type === 'rule-6-party' ? '/3670' : ''
					}" class="govuk-back-link">Back</a>`
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
					`href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}${
						proofOfEvidenceType.type === 'rule-6-party' ? '/3670' : ''
					}`
				);
				expect(unprettifiedHTML).toContain(
					`Accept ${proofOfEvidenceType.label} proof of evidence and witnesses</button>`
				);
				expect(unprettifiedHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/2/proof-of-evidence/${
						proofOfEvidenceType.type
					}${
						proofOfEvidenceType.type === 'rule-6-party' ? '/3670' : ''
					}/manage-documents/135568/?backUrl=/proof-of-evidence/${proofOfEvidenceType.type}${
						proofOfEvidenceType.type === 'rule-6-party' ? '/3670' : ''
					}/accept">Change<span class="govuk-visually-hidden"> proof of evidence and witnesses</span></a>`
				);
				expect(unprettifiedHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/2/proof-of-evidence/${
						proofOfEvidenceType.type
					}${
						proofOfEvidenceType.type === 'rule-6-party' ? '/3670' : ''
					}?backUrl=/appeals-service/appeal-details/2/proof-of-evidence/${
						proofOfEvidenceType.type
					}${proofOfEvidenceType.type === 'rule-6-party' ? '/3670' : ''}/accept">Change</a>`
				);
			});
		}
	});
});
