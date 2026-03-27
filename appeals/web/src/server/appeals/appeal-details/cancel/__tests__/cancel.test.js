import featureFlags from '#common/feature-flags.js';
import {
	appealData,
	appealDataEnforcementListedBuilding,
	appealDataEnforcementNotice,
	appellantCaseInvalidReasonsRealIds
} from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const cancelPath = '/cancel';
const mockAppealId = '1';
const originalIsFeatureActive = featureFlags.isFeatureActive;

describe('cancel', () => {
	beforeEach(installMockApi);
	afterEach(() => {
		featureFlags.isFeatureActive = originalIsFeatureActive;
		teardown();
	});

	describe('GET /new', () => {
		it('should render the cancel appeal page with radio components', async () => {
			const response = await request.get(`${baseUrl}/${mockAppealId}${cancelPath}`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Why are you cancelling the appeal?'
			);
			expect(element.querySelectorAll('[name="cancelReasonRadio"]').length).toBe(2);
			expect(element.querySelector('label[for="cancel-reason-radio"]')?.innerHTML.trim()).toBe(
				'Appeal invalid'
			);
			expect(element.querySelector('label[for="cancel-reason-radio-2"]')?.innerHTML.trim()).toBe(
				'Request to withdraw appeal'
			);
			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Continue');
		});

		it('should render the correct options for an enforcement notice appeal', async () => {
			featureFlags.isFeatureActive = () => true;
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, { ...appealDataEnforcementNotice });

			const response = await request.get(`${baseUrl}/${mockAppealId}${cancelPath}`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Why are you cancelling the appeal?'
			);
			expect(element.querySelectorAll('[name="cancelReasonRadio"]').length).toBe(4);
			expect(element.querySelector('label[for="cancel-reason-radio"]')?.innerHTML.trim()).toBe(
				'Appeal invalid'
			);
			expect(element.querySelector('label[for="cancel-reason-radio-2"]')?.innerHTML.trim()).toBe(
				'LPA has withdrawn the enforcement notice'
			);
			expect(element.querySelector('label[for="cancel-reason-radio-3"]')?.innerHTML.trim()).toBe(
				'Did not pay the ground (a) fee'
			);
			expect(element.querySelector('label[for="cancel-reason-radio-4"]')?.innerHTML.trim()).toBe(
				'Request to withdraw appeal'
			);
			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Continue');
		});

		it('should render the default options for an enforcement notice appeal when feature flag is off', async () => {
			featureFlags.isFeatureActive = () => false;
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, { ...appealDataEnforcementNotice });

			const response = await request.get(`${baseUrl}/${mockAppealId}${cancelPath}`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Why are you cancelling the appeal?'
			);
			expect(element.querySelectorAll('[name="cancelReasonRadio"]').length).toBe(2);
			expect(element.querySelector('label[for="cancel-reason-radio"]')?.innerHTML.trim()).toBe(
				'Appeal invalid'
			);
			expect(element.querySelector('label[for="cancel-reason-radio-2"]')?.innerHTML.trim()).toBe(
				'Request to withdraw appeal'
			);
			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Continue');
		});

		it('should have a back link to the appeal details page', async () => {
			const response = await request.get(`${baseUrl}/${mockAppealId}${cancelPath}`);
			const element = parseHtml(response.text, { rootElement: 'body' });
			expect(element.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/${mockAppealId}`
			);
		});

		it('should have a back link to the CYA page if editing and invalid selected', async () => {
			await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'invalid'
			});
			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F${mockAppealId}${cancelPath}`;
			const response = await request.get(`${baseUrl}/${mockAppealId}${cancelPath}${queryString}`);
			const element = parseHtml(response.text, { rootElement: 'body' });
			expect(element.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/${mockAppealId}/cancel/invalid/check-details`
			);
		});

		it('should have a back link to the CYA page if editing and enforcement-notice-withdrawn selected', async () => {
			await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'enforcement-notice-withdrawn'
			});
			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F${mockAppealId}${cancelPath}`;
			const response = await request.get(`${baseUrl}/${mockAppealId}${cancelPath}${queryString}`);
			const element = parseHtml(response.text, { rootElement: 'body' });
			expect(element.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/${mockAppealId}/cancel/enforcement-notice-withdrawal/check-details`
			);
		});
	});

	describe('GET (Enforcement listed building) /new', () => {
		it('should render the correct options for an ELB enforcement notice appeal', async () => {
			featureFlags.isFeatureActive = () => true;
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, { ...appealDataEnforcementListedBuilding });

			const response = await request.get(`${baseUrl}/${mockAppealId}${cancelPath}`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Why are you cancelling the appeal?'
			);
			expect(element.querySelectorAll('[name="cancelReasonRadio"]').length).toBe(3);
			expect(element.querySelector('label[for="cancel-reason-radio"]')?.innerHTML.trim()).toBe(
				'Appeal invalid'
			);
			expect(element.querySelector('label[for="cancel-reason-radio-2"]')?.innerHTML.trim()).toBe(
				'LPA has withdrawn the enforcement notice'
			);
			expect(element.innerHTML).not.toContain('Did not pay the ground (a) fee');
			expect(element.querySelector('label[for="cancel-reason-radio-3"]')?.innerHTML.trim()).toBe(
				'Request to withdraw appeal'
			);
			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Continue');
		});
	});

	describe('POST /new', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should redirect to the new invalid page if cancelReasonRadio is present in the request body and set to invalid', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'invalid'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				'/appeals-service/appeal-details/1/invalid/new?backUrl=%2Fappeals-service%2Fappeal-details%2F1%2Fcancel'
			);
		});

		it('should redirect to the start withdrawal page if cancelReasonRadio is present in the request body and set to withdrawal', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'withdrawal'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/withdrawal/new'
			);
		});

		it('should redirect to the correct page if enforcement-notice-withdrawn selected', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'enforcement-notice-withdrawn'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/cancel/enforcement-notice-withdrawal'
			);
		});

		it('should redirect to the correct page if did-not-pay selected', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'did-not-pay'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/cancel/check-details'
			);
		});

		it('should render cancel appeal page with errors if cancelReasonRadio is not present in request body', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<h2 class="govuk-error-summary__title"> There is a problem</h2>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Select why you are cancelling the appeal</p>'
			);
		});

		it('should render a 500 error page if cancelReasonRadio is present in the request body but not set to a valid value', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'something'
			});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});
	});

	describe('Get /check-details', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealDataEnforcementNotice.appealId}?include=all`)
				.reply(200, {
					...appealDataEnforcementNotice,
					enforcementNotice: {
						appealOutcome: {
							groundABarred: true
						},
						appellantCase: {
							reference: 'Reference',
							effectiveDate: '2026-01-01',
							groundAFeeDueDate: '2026-03-01',
							issueDate: '2026-02-01'
						}
					}
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/${appealDataEnforcementNotice.appealId}/case-team-email`)
				.reply(200, {
					id: 1,
					email: 'caseofficers@planninginspectorate.gov.uk',
					name: 'standard email'
				});
		});

		it('should render the check details screen', async () => {
			const mockAppellantPreview = nock('http://test/')
				.post(`/appeals/notify-preview/enforcement-cancel-appeal-no-fee-appellant.content.md`)
				.reply(200, { renderedHtml: '' });
			const mockLpaPreview = nock('http://test/')
				.post(`/appeals/notify-preview/enforcement-cancel-appeal-no-fee-lpa.content.md`)
				.reply(200, { renderedHtml: '' });

			const response = await request.get(
				`${baseUrl}/${appealDataEnforcementNotice.appealId}/cancel/check-details`
			);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.querySelector('h1')?.innerHTML.trim()).toBe('Check details and cancel appeal');

			const rows = element.querySelectorAll('.govuk-summary-list__row');
			expect(rows.length).toBe(1);
			expect(rows[0].querySelector('.govuk-summary-list__key')?.innerHTML.trim()).toBe(
				'Why are you cancelling the appeal?'
			);
			expect(rows[0].querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
				'Did not pay the ground (a) fee'
			);
			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Cancel appeal');

			expect(mockAppellantPreview.isDone()).toBe(true);
			expect(mockLpaPreview.isDone()).toBe(true);

			expect(
				element.querySelector('#appellant-preview .govuk-details__summary-text')?.innerHTML.trim()
			).toBe('Preview email to appellant');
			expect(
				element.querySelector('#lpa-preview .govuk-details__summary-text')?.innerHTML.trim()
			).toBe('Preview email to LPA');
		});
	});

	describe('POST /check-details', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealDataEnforcementNotice.appealId}?include=all`)
				.reply(200, {
					...appealDataEnforcementNotice,
					enforcementNotice: {
						appealOutcome: {
							groundABarred: true
						},
						appellantCase: {
							reference: 'Reference',
							effectiveDate: '2026-01-01',
							groundAFeeDueDate: '2026-03-01',
							issue_date: '2026-02-01'
						}
					}
				})
				.persist();
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasonsRealIds)
				.persist();
			nock('http://test/').get('/appeals/1/case-team-email').reply(200, {
				id: 1,
				email: 'caseofficers@planninginspectorate.gov.uk',
				name: 'standard email'
			});
			nock('http://test/')
				.patch(`/appeals/${appealDataEnforcementNotice.appealId}/appellant-cases/0`)
				.reply(200);
		});

		it('should redirect on success', async () => {
			const response = await request.post(
				`${baseUrl}/${appealDataEnforcementNotice.appealId}/cancel/check-details`
			);
			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealDataEnforcementNotice.appealId}`);
		});
	});
});
