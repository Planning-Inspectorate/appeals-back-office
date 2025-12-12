// @ts-nocheck
import { appealData as rawAppealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

const appealData = {
	...rawAppealData,
	appealRule6Parties: [
		{
			id: 1,
			serviceUser: {
				organisationName: 'Test Organisation',
				email: 'test@example.com'
			}
		}
	]
};

describe('change rule 6 party', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /rule-6-parties/change/:rule6PartyId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/2?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId: 2 });
		});

		it('should redirect to /rule-6-parties/change/:rule6PartyId/name', async () => {
			const response = await request.get(
				`${baseUrl}/2/rule-6-parties/change/1?backUrl=%2Fappeals-service%2Fappeal-details%2F2`
			);
			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/2/rule-6-parties/change/1/name?backUrl=%2Fappeals-service%2Fappeal-details%2F2`
			);
		});

		it('should return 400 if the rule 6 party id is not a number', async () => {
			const response = await request.get(`${baseUrl}/2/rule-6-parties/change/abc`);
			expect(response.statusCode).toBe(400);
			expect(response.text).toContain('Sorry, there is a problem with your request');
		});
	});

	describe('GET /rule-6-parties/change/:rule6PartyId/name', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/rule-6-parties/change/1/name`);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1 label')?.innerHTML.trim()).toBe('Rule 6 party name');
		});

		it('should render a Name field', () => {
			expect(pageHtml.querySelector('input#organisation-name')).not.toBeNull();
		});

		it('should have a back link to the appeal details page', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}`
			);
		});

		it('should have a back link to the original page if specified', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/rule-6-parties/change/1/name?backUrl=/my-cases`
			);
			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe('/my-cases');
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/rule-6-parties/change/1/name?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Frule-6-parties%2Fchange%2F1%2Fname`
			);
			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/rule-6-parties/change/1/check-details`
			);
		});

		it('should render the existing name if no new name has yet been submitted', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.twice()
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/rule-6-parties/change/1/name`);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#organisation-name').getAttribute('value')).toEqual(
				'Test Organisation'
			);
		});

		it('should render any saved response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.twice()
				.reply(200, { ...appealData, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/name`).send({
				organisationName: 'Another Name'
			});

			const response = await request.get(`${baseUrl}/${appealId}/rule-6-parties/change/1/name`);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#organisation-name').getAttribute('value')).toEqual(
				'Another Name'
			);
		});

		it('should render an edited response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.times(3)
				.reply(200, { ...appealData, appealId });

			const pageUrl = `${baseUrl}/${appealId}/rule-6-parties/change/1/name`;
			const editUrl = `${pageUrl}?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Frule-6-parties%2Fchange%2F1%2Fname`;

			//set session data with post request
			await request.post(pageUrl).send({
				organisationName: 'Another Name'
			});
			await request.post(editUrl).send({
				organisationName: 'Edited Name'
			});

			const response = await request.get(editUrl);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#organisation-name').getAttribute('value')).toEqual(
				'Edited Name'
			);
		});
	});

	describe('POST /rule-6-parties/change/:rule6PartyId/name', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /rule-6-parties/change/:rule6PartyId/email with valid inputs', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/name`)
				.send({
					organisationName: 'Test Organisation'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/rule-6-parties/change/1/email`
			);
		});

		it('should return 400 on missing name with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/name`)
				.send({
					organisationName: ''
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a Rule 6 party name');
		});

		it('should return 400 on name over 300 characters with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/name`)
				.send({
					organisationName: 'T'.repeat(301)
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('The name must be between 3 and 300 characters');
		});
		it('should return 400 on name under 3 characters with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/name`)
				.send({
					organisationName: 'T'.repeat(2)
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('The name must be between 3 and 300 characters');
		});
	});

	describe('GET /rule-6-parties/change/:rule6PartyId/email', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/rule-6-parties/change/1/email`);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1 label')?.innerHTML.trim()).toBe(
				'Rule 6 party email address'
			);
		});

		it('should render an email address field', () => {
			expect(pageHtml.querySelector('input#email')).not.toBeNull();
		});

		it('should have a back link to the name page', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/rule-6-parties/change/1/name`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/rule-6-parties/change/1/email?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Frule-6-parties%2Fchange%2F1%2Femail`
			);
			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/rule-6-parties/change/1/check-details`
			);
		});

		it('should render the existing email if no new email has yet been submitted', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.twice()
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/rule-6-parties/change/1/email`);
			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#email').getAttribute('value')).toEqual(
				'test@example.com'
			);
		});

		it('should render any saved response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.twice()
				.reply(200, { ...appealData, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/email`).send({
				email: 'test2@example2.com'
			});

			const response = await request.get(`${baseUrl}/${appealId}/rule-6-parties/change/1/email`);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#email').getAttribute('value')).toEqual(
				'test2@example2.com'
			);
		});

		it('should render an edited response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.times(3)
				.reply(200, { ...appealData, appealId });

			const pageUrl = `${baseUrl}/${appealId}/rule-6-parties/change/1/email`;
			const editUrl = `${pageUrl}?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Frule-6-parties%2Fchange%2F1%2Femail`;

			//set session data with post request
			await request.post(pageUrl).send({
				email: 'test2@example2.com'
			});
			await request.post(editUrl).send({
				email: 'test3@example3.com'
			});

			const response = await request.get(editUrl);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#email').getAttribute('value')).toEqual(
				'test3@example3.com'
			);
		});
	});

	describe('POST /rule-6-parties/change/:rule6PartyId/email', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to CYA page with valid inputs', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/email`)
				.send({
					email: 'test@example.com'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/rule-6-parties/change/1/check-details`
			);
		});

		it('should return 400 on missing email with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/email`)
				.send({
					email: ''
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a Rule 6 party email address<');
		});

		it('should return 400 on too long email with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/email`)
				.send({
					email: `${'a'.repeat(300)}@example.com`
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Email must be 254 characters or less');
		});

		it('should return 400 on invalid email address with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/email`)
				.send({
					email: 'test@example@com'
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'>Enter an email address in the correct format, like name@example.com'
			);
		});
	});

	describe('GET /rule-6-parties/change/:rule6PartyId/check-details', () => {
		const appealId = 2;
		let pageHtml;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.times(3)
				.reply(200, { ...appealData, appealId });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/name`).send({
				organisationName: 'Test Organisation'
			});
			await request.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/email`).send({
				email: 'test@example.com'
			});

			const response = await request.get(
				`${baseUrl}/${appealId}/rule-6-parties/change/1/check-details`
			);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Check details and update rule 6 party'
			);
		});

		it('should render the correct name', () => {
			expect(pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[0]?.innerHTML.trim()).toBe(
				'Test Organisation'
			);
		});

		it('should render the correct email address', () => {
			expect(pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[1]?.innerHTML.trim()).toBe(
				'test@example.com'
			);
		});

		it('should render the correct button text', () => {
			expect(pageHtml.querySelector('button')?.innerHTML.trim()).toBe('Change rule 6 party');
		});

		it('should have a back link to the email address page', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/rule-6-parties/change/1/email`
			);
		});
	});

	describe('POST /rule-6-parties/change/:rule6PartyId/check-details', () => {
		const appealId = 2;

		it('should redirect to the appeal details page with valid inputs', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appealRule6Parties`)
				.times(3)
				.reply(200, { ...appealData, appealId });

			const updateRule6PartyMock = nock('http://test/')
				.patch(`/appeals/${appealId}/rule-6-parties/1`, {
					serviceUser: {
						organisationName: 'Another Organisation',
						email: 'test2@example2.com'
					}
				})
				.reply(200, { id: 1 });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/name`).send({
				organisationName: 'Another Organisation'
			});
			await request.post(`${baseUrl}/${appealId}/rule-6-parties/change/1/email`).send({
				email: 'test2@example2.com'
			});
			const response = await request.post(
				`${baseUrl}/${appealId}/rule-6-parties/change/1/check-details`
			);

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`/appeals-service/appeal-details/${appealId}`);
			expect(updateRule6PartyMock.isDone()).toBe(true);
		});
	});
});
