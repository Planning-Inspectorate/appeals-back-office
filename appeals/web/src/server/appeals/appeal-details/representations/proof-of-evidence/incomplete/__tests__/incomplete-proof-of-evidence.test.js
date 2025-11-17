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

	describe('POST /reasons', () => {
		it('should return validation error when no reason is selected', async () => {
			const response = await request
				.post(`${baseUrl}/2/proof-of-evidence/appellant/incomplete/reasons`)
				.send({});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('.govuk-error-summary__list li')?.textContent).toContain(
				'Select why the proof of evidence and witnesses are incomplete'
			);
		});
		it('should return validation error when both a "Supporting documents missing" (29) and "Other Reason" (30) are selected but the "Other Reason" field text is empty', async () => {
			const response = await request
				.post(`${baseUrl}/2/proof-of-evidence/appellant/incomplete/reasons`)
				.send({
					rejectionReason: ['10', '30'],
					'rejectionReason-30': '' // empty field should trigger validation
				});

			const element = parseHtml(response.text);

			expect(element.querySelector('.govuk-error-summary__list li')?.textContent).toContain(
				'Enter a reason'
			);
		});

		it('should return validation error when "Other Reason" (30) is selected but no text provided', async () => {
			const response = await request
				.post(`${baseUrl}/2/proof-of-evidence/appellant/incomplete/reasons`)
				.send({
					rejectionReason: ['30'],
					'rejectionReason-30': '' // no text entered
				});

			const element = parseHtml(response.text);

			expect(element.querySelector('.govuk-error-summary__list li')?.textContent).toContain(
				'Enter a reason'
			);
		});

		it('should save valid data and redirect to the next step if only Supporting documents missing is selected', async () => {
			const response = await request
				.post(`${baseUrl}/2/proof-of-evidence/appellant/incomplete/reasons`)
				.send({
					rejectionReason: ['29'],
					'rejectionReason-30': ''
				});

			// successful submissions usually redirect (303 or 302)
			expect([302, 303]).toContain(response.status);
			expect(response.headers.location).toContain(
				'/appeals-service/appeal-details/2/proof-of-evidence/appellant/incomplete/confirm'
			);
		});

		it('should save valid data and redirect to the next step if "Supporting documents missing" and "Other reason" is selected', async () => {
			const response = await request
				.post(`${baseUrl}/2/proof-of-evidence/appellant/incomplete/reasons`)
				.send({
					rejectionReason: ['29', '30'],
					'rejectionReason-30': 'Testing'
				});

			// successful submissions usually redirect (303 or 302)
			expect([302, 303]).toContain(response.status);
			expect(response.headers.location).toContain(
				'/appeals-service/appeal-details/2/proof-of-evidence/appellant/incomplete/confirm'
			);
		});
	});

	describe('GET /confirm', () => {
		for (const proofOfEvidenceType of proofOfEvidenceTypes) {
			it(`should render the incomplete ${proofOfEvidenceType.type} proof of evidence CYA page with the expected content`, async () => {
				const reasonResponse = await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/incomplete/reasons`)
					.send({
						rejectionReason: '1',
						'rejectionReason-1': 'Rejcection reason 1'
					});

				expect(reasonResponse.status).toBe(302);

				const response = await request.get(
					`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/incomplete/confirm`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const pageHtml = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: 'body'
				}).innerHTML;

				expect(pageHtml).toContain(
					`href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/incomplete/reasons" class="govuk-back-link">Back</a>`
				);

				expect(pageHtml).toContain(
					`Check details and reject ${
						proofOfEvidenceType.type === 'lpa' ? 'LPA' : 'appellant'
					} proof of evidence and witnesses</h1>`
				);

				expect(pageHtml).toContain(
					`href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/incomplete/reasons">Change`
				);
				expect(pageHtml).toContain(`Proof of evidence and witnesses</dt>`);
				expect(pageHtml).toContain(
					`href="/documents/4881/download/ed52cdc1-3cc2-462a-8623-c1ae256969d6/blank copy 5.pdf" target="_blank">blank copy 5.pdf</a>`
				);
				expect(pageHtml).toContain(
					`href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}/manage-documents/135568/?backUrl=/proof-of-evidence/${proofOfEvidenceType.type}/incomplete/confirm">Change <span class="govuk-visually-hidden">supporting documents</span></a>`
				);

				expect(pageHtml).toContain(`Review decision</dt>`);
				expect(pageHtml).toContain(` Reject proof of evidence and witnesses</dd>`);

				expect(pageHtml).toContain(
					`href="/appeals-service/appeal-details/2/proof-of-evidence/${proofOfEvidenceType.type}">Change <span class="govuk-visually-hidden">Review decision</span></a>`
				);
				expect(pageHtml).toContain(
					`Reason for rejecting the ${
						proofOfEvidenceType.type === 'lpa' ? 'LPA' : 'appellant'
					} proof of evidence and witnesses</dt>`
				);

				expect(pageHtml).toContain(`Received after deadline`);
				expect(pageHtml).toContain(`Incomplete reasons</span></a>`);

				expect(pageHtml).toContain(`Confirm statement is incomplete</button>`);
			});
		}
	});

	describe('POST /confirm', () => {
		for (const proofOfEvidenceType of proofOfEvidenceTypes) {
			it(`should render the incomplete appellant proof of evidence page with the expected content`, async () => {
				let requestBody;
				const mockResult = nock('http://test/')
					.patch('/appeals/2/reps/3670/rejection-reasons')
					.reply(200, (uri, body) => {
						requestBody = body;
						return {};
					});

				const reasonResponse = await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/incomplete/reasons`)
					.send({
						rejectionReason: '1',
						'rejectionReason-1': 'Rejcection reason 1'
					});

				expect(reasonResponse.status).toBe(302);

				await request
					.post(`${baseUrl}/2/proof-of-evidence/${proofOfEvidenceType.type}/incomplete/confirm`)
					.send({});

				expect(mockResult.isDone()).toBe(true);
				expect(mockResult.pendingMocks()).toEqual([]);
				expect(requestBody).toMatchObject({
					rejectionReasons: [
						{
							id: 1,
							text: ['Rejcection reason 1']
						}
					]
				});
			});
		}
	});
});
