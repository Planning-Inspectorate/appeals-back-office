import {
	appealData,
	appealDataEnforcementNotice,
	appellantCaseInvalidReasonsRealIds
} from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import { FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const mockAppealId = appealDataEnforcementNotice.appealId;

describe('cancel invalid', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /invalid/reason', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasonsRealIds);
		});

		it('should render the invalid reasons page with the correct radio components', async () => {
			const response = await request.get(`${baseUrl}/${mockAppealId}/cancel/invalid/reason`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1')?.innerHTML.trim()).toBe('Why is the appeal invalid?');
			const options = element.querySelectorAll(
				'#invalid-reason-checkboxes .govuk-checkboxes__item'
			);
			expect(options.length).toBe(5);
			expect(options[0].querySelector('label')?.innerHTML.trim()).toBe(
				'Appeal has not been submitted on time'
			);
			expect(options[1].querySelector('label')?.innerHTML.trim()).toBe(
				'Documents have not been submitted on time'
			);
			expect(options[2].querySelector('label')?.innerHTML.trim()).toBe(
				'Appellant does not have a legal interest in the land'
			);
			expect(options[3].querySelector('label')?.innerHTML.trim()).toBe(
				'The appellant does not have the right to appeal'
			);
			expect(options[4].querySelector('label')?.innerHTML.trim()).toBe('Other reason');
			expect(element.querySelector('#invalid-reason-4-1')).toBeDefined();
			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Continue');
		});

		it('should pre-select previously submitted values', async () => {
			await request.post(`${baseUrl}/${mockAppealId}/cancel/invalid/reason`).send({
				invalidReason: ['1', '4'],
				'invalidReason-4': 'Eminently legitimate reason'
			});
			const response = await request.get(`${baseUrl}/${mockAppealId}/cancel/invalid/reason`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1')?.innerHTML.trim()).toBe('Why is the appeal invalid?');
			const options = element.querySelectorAll(
				'#invalid-reason-checkboxes .govuk-checkboxes__item'
			);
			expect(options.length).toBe(5);
			expect(options[0].querySelector('input')?.getAttribute('checked')).toBeDefined();
			expect(options[1].querySelector('input')?.getAttribute('checked')).toBeUndefined();
			expect(options[2].querySelector('input')?.getAttribute('checked')).toBeUndefined();
			expect(options[3].querySelector('input')?.getAttribute('checked')).toBeUndefined();
			expect(options[4].querySelector('input')?.getAttribute('checked')).toBeDefined();
			expect(element.querySelector('#invalid-reason-4-1')?.getAttribute('value')).toBe(
				'Eminently legitimate reason'
			);
		});

		it('should have a back link to the previous page', async () => {
			const response = await request.get(`${baseUrl}/${mockAppealId}/cancel/invalid/reason`);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/${mockAppealId}/cancel`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F${mockAppealId}%2Fcancel%2Finvalid%2Freason`;
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/invalid/reason${queryString}`
			);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/${mockAppealId}/cancel/invalid/check-details`
			);
		});
	});

	describe('POST /invalid/reason', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasonsRealIds);
		});

		it('should redirect to the other live appeals page for a householder appeal', async () => {
			nock('http://test/').get(`/appeals/${mockAppealId}?include=all`).reply(200, appealData);

			const response = await request.post(`${baseUrl}/${mockAppealId}/cancel/invalid/reason`).send({
				invalidReason: ['1', '4'],
				'invalidReason-4': 'Eminently legitimate reason'
			});
			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealData.appealId}/cancel/invalid/check-details`
			);
		});

		it('should redirect to the other live appeals page for an enforcement notice appeal', async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice);

			const response = await request.post(`${baseUrl}/${mockAppealId}/cancel/invalid/reason`).send({
				invalidReason: ['1', '4'],
				'invalidReason-4': 'Eminently legitimate reason'
			});
			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${mockAppealId}/cancel/invalid/other-live-appeals`
			);
		});

		it('should re-render the page with errors if no reason selected', async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice);

			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/invalid/reason`)
				.send({});
			expect(response.status).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.querySelector('h1')?.innerHTML.trim()).toBe('Why is the appeal invalid?');
			expect(element.querySelector('.govuk-error-summary__title')?.innerHTML.trim()).toBe(
				'There is a problem'
			);
			expect(element.querySelector('.govuk-error-summary__body a')?.innerHTML.trim()).toBe(
				'Select why the appeal is invalid'
			);
		});

		it('should re-render the page with errors if no text provided for other', async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice);

			const response = await request.post(`${baseUrl}/${mockAppealId}/cancel/invalid/reason`).send({
				invalidReason: ['4'],
				'invalidReason-4': ''
			});
			expect(response.status).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.querySelector('h1')?.innerHTML.trim()).toBe('Why is the appeal invalid?');
			expect(element.querySelector('.govuk-error-summary__title')?.innerHTML.trim()).toBe(
				'There is a problem'
			);
			expect(element.querySelector('.govuk-error-summary__body a')?.innerHTML.trim()).toBe(
				'Enter a reason'
			);
		});
	});

	describe('GET /other-live-appeals', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
		});

		it('should render the other live appeals page with the correct radio components', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/invalid/other-live-appeals`
			);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Are there any other live appeals against the enforcement notice?'
			);
			const options = element.querySelectorAll('.govuk-radios .govuk-radios__item');
			expect(options.length).toBe(2);
			expect(options[0].querySelector('label')?.innerHTML.trim()).toBe('Yes');
			expect(options[1].querySelector('label')?.innerHTML.trim()).toBe('No');
			expect(element.querySelector('#otherLiveAppeals')?.getAttribute('checked')).toBeUndefined();
			expect(element.querySelector('#otherLiveAppeals-2')?.getAttribute('checked')).toBeUndefined();
			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Continue');
		});

		it('should pre-select the previously submitted value', async () => {
			await request.post(`${baseUrl}/${mockAppealId}/cancel/invalid/other-live-appeals`).send({
				otherLiveAppeals: 'yes'
			});
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/invalid/other-live-appeals`
			);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('#otherLiveAppeals')?.getAttribute('checked')).toBeDefined();
			expect(element.querySelector('#otherLiveAppeals-2')?.getAttribute('checked')).toBeUndefined();
			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Continue');
		});

		it('should have a back link to the previous page', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/invalid/other-live-appeals`
			);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/${mockAppealId}/cancel/invalid/reason`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F${mockAppealId}%2Fcancel%2Finvalid%2Fother-live-appeals`;
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/invalid/other-live-appeals${queryString}`
			);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/${mockAppealId}/cancel/invalid/check-details`
			);
		});
	});

	describe('POST /other-live-appeals', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
		});

		it('should re-render the page with errors if no value selected', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/invalid/other-live-appeals`)
				.send({});
			expect(response.status).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Are there any other live appeals against the enforcement notice?'
			);
			expect(element.querySelector('.govuk-error-summary__title')?.innerHTML.trim()).toBe(
				'There is a problem'
			);
			expect(element.querySelector('.govuk-error-summary__body a')?.innerHTML.trim()).toBe(
				'Select yes if there are any other live appeals against the enforcement notice'
			);
		});

		it('should redirect to the CYA page if a value is selected', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/invalid/other-live-appeals`)
				.send({
					otherLiveAppeals: 'yes'
				});
			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${mockAppealId}/cancel/invalid/check-details`
			);
		});
	});

	describe('GET /check-details', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, {
					...appealDataEnforcementNotice,
					enforcementNotice: {
						appealOutcome: {
							groundABarred: true
						},
						appellantCase: {
							reference: 'Reference',
							effectiveDate: '2026-01-01'
						}
					}
				})
				.persist();
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasonsRealIds)
				.persist();
		});

		it('should render the check details page with the correct content', async () => {
			let appellantPreviewRequestBody, lpaPreviewRequestBody;

			const mockAppellantPreview = nock('http://test/')
				.post('/appeals/notify-preview/enforcement-appeal-invalid-appellant.content.md', (body) => {
					appellantPreviewRequestBody = body;
					return true;
				})
				.reply(200, { renderedHtml: 'Appellant preview HTML' });

			const mockLpaPreview = nock('http://test/')
				.post('/appeals/notify-preview/enforcement-appeal-invalid-lpa.content.md', (body) => {
					lpaPreviewRequestBody = body;
					return true;
				})
				.reply(200, { renderedHtml: 'LPA preview HTML' });

			nock('http://test/')
				.get(`/appeals/${mockAppealId}/case-team-email`)
				.reply(200, {
					id: 1,
					email: 'caseofficers@planninginspectorate.gov.uk',
					name: 'Test Team'
				})
				.persist();

			await request.post(`${baseUrl}/${mockAppealId}/cancel/invalid/reason`).send({
				invalidReason: ['1', '4'],
				'invalidReason-4': 'Eminently legitimate reason'
			});
			await request.post(`${baseUrl}/${mockAppealId}/cancel/invalid/other-live-appeals`).send({
				otherLiveAppeals: 'yes'
			});
			const response = await request.get(`${baseUrl}/${mockAppealId}/cancel/invalid/check-details`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Check details and mark appeal as invalid'
			);

			const rows = element.querySelectorAll('.govuk-summary-list__row');
			expect(rows.length).toBe(3);
			expect(rows[0].querySelector('.govuk-summary-list__key')?.innerHTML.trim()).toBe(
				'Why are you cancelling the appeal?'
			);
			expect(rows[0].querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
				'Appeal invalid'
			);
			expect(rows[1].querySelector('.govuk-summary-list__key')?.innerHTML.trim()).toBe(
				'Why is the appeal invalid?'
			);
			const reasons = rows[1].querySelectorAll('.govuk-summary-list__value .pins-show-more li');
			expect(reasons.length).toBe(2);
			expect(reasons[0].innerHTML.trim()).toBe('Appeal has not been submitted on time');
			expect(reasons[1].innerHTML.trim()).toBe('Other reason: Eminently legitimate reason');
			expect(rows[2].querySelector('.govuk-summary-list__key')?.innerHTML.trim()).toBe(
				'Are there any other live appeals against the enforcement notice?'
			);
			expect(rows[2].querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe('Yes');

			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Mark appeal as invalid');

			expect(mockAppellantPreview.isDone()).toBe(true);
			const personalisation = {
				appeal_reference_number: appealDataEnforcementNotice.appealReference,
				other_live_appeals: 'yes',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				enforcement_reference: 'Reference',
				effective_date: '01 January 2026',
				reasons: [
					'Appeal has not been submitted on time',
					'Other reason: Eminently legitimate reason'
				],
				ground_a_barred: true
			};
			expect(appellantPreviewRequestBody).toMatchObject({
				...personalisation,
				feedback_link: FEEDBACK_FORM_LINKS.ENFORCEMENT_NOTICE
			});
			expect(mockLpaPreview.isDone()).toBe(true);
			expect(lpaPreviewRequestBody).toMatchObject({
				...personalisation,
				feedback_link: FEEDBACK_FORM_LINKS.LPA
			});

			expect(
				element.querySelector('#appellant-preview .govuk-details__text')?.innerHTML.trim()
			).toBe('Appellant preview HTML');
			expect(element.querySelector('#lpa-preview .govuk-details__text')?.innerHTML.trim()).toBe(
				'LPA preview HTML'
			);
		});
	});

	describe('POST /check-details', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasonsRealIds)
				.persist();
		});

		it('should redirect to the appeal details page on success', async () => {
			let appellantCasesRequestBody;
			const mockAppellantCasesEndpoint = nock('http://test/')
				.patch(`/appeals/${mockAppealId}/appellant-cases/0`, (body) => {
					appellantCasesRequestBody = body;
					return true;
				})
				.reply(200);

			await request.post(`${baseUrl}/${mockAppealId}/cancel/invalid/reason`).send({
				invalidReason: ['1', '4'],
				'invalidReason-4': 'Eminently legitimate reason'
			});
			await request.post(`${baseUrl}/${mockAppealId}/cancel/invalid/other-live-appeals`).send({
				otherLiveAppeals: 'yes'
			});
			const response = await request.post(
				`${baseUrl}/${mockAppealId}/cancel/invalid/check-details`
			);
			expect(mockAppellantCasesEndpoint.isDone()).toBe(true);
			expect(appellantCasesRequestBody).toEqual({
				validationOutcome: 'invalid',
				invalidReasons: [{ id: 1 }, { id: 4, text: ['Eminently legitimate reason'] }],
				otherLiveAppeals: 'yes',
				enforcementNoticeInvalid: 'no'
			});
			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${mockAppealId}`);
		});
	});
});
