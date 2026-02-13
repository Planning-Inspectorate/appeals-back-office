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

		nock('http://test/').get('/appeals/2/case-notes').reply(200, []).persist();

		nock('http://test/').get('/appeals/2/appellant-cases/0').reply(200, {}).persist();

		nock('http://test/')
			.get('/appeals/2/reps?type=appellant_final_comment,lpa_final_comment')
			.reply(200, { items: [], itemCount: 0 })
			.persist();

		nock('http://test/')
			.get(
				'/appeals/2/reps?type=appellant_final_comment,lpa_final_comment,appellant_proofs_evidence,lpa_proofs_evidence'
			)
			.reply(200, { items: [], itemCount: 0 })
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
	describe('POST /', () => {
		it('should call the API to accept the proof of evidence and redirect to the case details page with a success banner', async () => {
			const proofOfEvidenceType = proofOfEvidenceTypes[2];
			const rule6Representation = {
				...proofOfEvidenceForReviewWithAttachments,
				items: [
					{
						...proofOfEvidenceForReviewWithAttachments.items[0],
						representationType: 'rule_6_party_proofs_evidence'
					}
				]
			};

			nock('http://test/')
				.get(`/appeals/2/reps?type=rule_6_party_proofs_evidence`)
				.reply(200, rule6Representation)
				.persist();

			nock('http://test/')
				.patch(`/appeals/2/reps/3670`)
				.reply(200, {
					...rule6Representation.items[0],
					status: 'valid'
				})
				.persist();

			const response = await request.post(
				`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/3670/accept`
			);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(`Found. Redirecting to /appeals-service/appeal-details/2`);

			const responseFromRedirect = await request.get('/appeals-service/appeal-details/2');

			const notificationBannerHtml = parseHtml(responseFromRedirect.text, {
				rootElement: '.govuk-notification-banner--success',
				skipPrettyPrint: true
			}).innerHTML;

			expect(notificationBannerHtml).toContain('Success</h3>');
			expect(notificationBannerHtml).toContain(
				'Test Rule 6 Party proof of evidence and witnesses accepted</p>'
			);
		});
	});
});
