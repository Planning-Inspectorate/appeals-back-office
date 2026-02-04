import {
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
const mockAppealId = '1';

describe('cancel enforcement', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /invalid', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasonsRealIds);
		});

		it('should render the invalid reasons page with the correct radio components', async () => {
			const response = await request.get(`${baseUrl}/${mockAppealId}/cancel/enforcement/invalid`);
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
			await request.post(`${baseUrl}/${mockAppealId}/cancel/enforcement/invalid`).send({
				invalidReason: ['1', '4'],
				'invalidReason-4': 'Eminently legitimate reason'
			});
			const response = await request.get(`${baseUrl}/${mockAppealId}/cancel/enforcement/invalid`);
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
			const response = await request.get(`${baseUrl}/${mockAppealId}/cancel/enforcement/invalid`);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/${mockAppealId}/cancel`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			const queryString =
				'?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fcancel%2Fenforcement%2Finvalid';
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/invalid${queryString}`
			);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/check-details`
			);
		});
	});

	describe('POST /invalid', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasonsRealIds);
		});

		it('should redirect to the legal interest page if no legal interest is selected', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/enforcement/invalid`)
				.send({ invalidReason: ['1', '6'] });
			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/legal-interest`
			);
		});

		it('should redirect to the other live appeals page if no legal interest not selected', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/enforcement/invalid`)
				.send({
					invalidReason: ['1', '4'],
					'invalidReason-4': 'Eminently legitimate reason'
				});
			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/other-live-appeals`
			);
		});

		it('should re-render the page with errors if no reason selected', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/enforcement/invalid`)
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
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/enforcement/invalid`)
				.send({
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

	describe('GET /legal-interest', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice);
		});

		it('should render the legal interest page with the correct radio components', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/legal-interest`
			);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Did the appellant send any information about their legal interest in the land?'
			);
			const options = element.querySelectorAll('#legal-interest .govuk-radios__item');
			expect(options.length).toBe(2);
			expect(options[0].querySelector('label')?.innerHTML.trim()).toBe('Yes');
			expect(options[1].querySelector('label')?.innerHTML.trim()).toBe('No');
			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Continue');
		});

		it('should pre-select previously submitted values', async () => {
			await request.post(`${baseUrl}/${mockAppealId}/cancel/enforcement/legal-interest`).send({
				legalInterest: 'yes'
			});
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/legal-interest`
			);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Did the appellant send any information about their legal interest in the land?'
			);
			const options = element.querySelectorAll('#legal-interest .govuk-radios__item');
			expect(options.length).toBe(2);
			expect(options[0].querySelector('input')?.getAttribute('checked')).toBeDefined();
			expect(options[1].querySelector('input')?.getAttribute('checked')).toBeUndefined();
		});

		it('should have a back link to the invalid page', async () => {
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/legal-interest`
			);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/invalid`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			const queryString =
				'?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F1%2Fcancel%2Fenforcement%2Flegal-interest';
			const response = await request.get(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/legal-interest${queryString}`
			);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/check-details`
			);
		});
	});

	describe('POST /legal-interest', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${mockAppealId}?include=all`)
				.reply(200, appealDataEnforcementNotice);
		});

		it('should redirect to the other live appeals page when yes is selected', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/enforcement/legal-interest`)
				.send({ legalInterest: 'yes' });
			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/other-live-appeals`
			);
		});

		it('should redirect to the other live appeals page when no is selected', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/enforcement/legal-interest`)
				.send({ legalInterest: 'no' });
			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${mockAppealId}/cancel/enforcement/other-live-appeals`
			);
		});

		it('should re-render the page with errors if no option selected', async () => {
			const response = await request
				.post(`${baseUrl}/${mockAppealId}/cancel/enforcement/legal-interest`)
				.send({});
			expect(response.status).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Did the appellant send any information about their legal interest in the land?'
			);
			expect(element.querySelector('.govuk-error-summary__title')?.innerHTML.trim()).toBe(
				'There is a problem'
			);
			expect(element.querySelector('.govuk-error-summary__body a')?.innerHTML.trim()).toBe(
				'Select yes if the appellant sent any information about their legal interest in the land'
			);
		});
	});
});
