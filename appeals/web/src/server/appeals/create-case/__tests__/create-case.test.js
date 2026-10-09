// @ts-nocheck
import { createTestEnvironment } from '#testing/index.js';
import { GENERIC_APPEAL_TYPES } from '@pins/appeals/constants/common.js';
import { parseHtml } from '@pins/platform';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/create-a-case';

describe('create a case', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /', () => {
		it('should redirect to /select-case-type and clear session', async () => {
			const response = await request.get(baseUrl);

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/select-case-type`);
		});
	});

	describe('GET /select-case-type', () => {
		let pageHtml;

		beforeAll(async () => {
			const response = await request.get(`${baseUrl}/select-case-type`);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should render the correct heading and caption', () => {
			expect(pageHtml.querySelector('main h1')?.innerHTML.trim()).toBe('Choose the case type');
			expect(pageHtml.querySelector('main .govuk-caption-l')?.innerHTML.trim()).toBe(
				'Create a case'
			);
		});

		it('should render 8 radio options for case types with correct labels and values', () => {
			const radioInputs = pageHtml.querySelectorAll('input[type="radio"][name="caseType"]');
			expect(radioInputs.length).toBe(8);

			const expectedTypes = Object.values(GENERIC_APPEAL_TYPES);
			expectedTypes.forEach((type) => {
				const radioInput = pageHtml.querySelector(`input[type="radio"][value="${type}"]`);
				expect(radioInput).not.toBeNull();

				const label = pageHtml.querySelector(`label[for="${radioInput.getAttribute('id')}"]`);
				expect(label?.innerHTML.trim()).toBe(type);
			});
		});

		it('should render the Continue button', () => {
			const submitButton = pageHtml.querySelector('button[type="submit"]');
			expect(submitButton?.innerHTML.trim()).toBe('Continue');
		});

		it('should have a default back link to /appeals-service/all-cases', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				'/appeals-service/all-cases'
			);
		});

		it('should use returnUrl as back link when provided', async () => {
			const response = await request.get(`${baseUrl}/select-case-type?returnUrl=/custom-back`);
			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe('/custom-back');
		});

		it('should highlight Create a case navigation tab in header', async () => {
			const response = await request.get(`${baseUrl}/select-case-type`);
			const html = parseHtml(response.text, { rootElement: 'header' });

			const activeNavLink = html.querySelector(
				'.govuk-header__navigation-item--active a.govuk-header__link'
			);
			expect(activeNavLink?.getAttribute('href')).toBe('/appeals-service/create-a-case');
			expect(activeNavLink?.innerHTML.trim()).toBe('Create a case');
		});

		it('should render any saved session response', async () => {
			await request.post(`${baseUrl}/select-case-type`).send({
				caseType: 'High hedges appeal'
			});

			const response = await request.get(`${baseUrl}/select-case-type`);
			pageHtml = parseHtml(response.text);

			const highHedgesRadio = pageHtml.querySelector('input[value="High hedges appeal"]');
			expect(highHedgesRadio.hasAttribute('checked')).toBe(true);
		});
	});

	describe('POST /select-case-type', () => {
		it('should redirect to next page (/submission-date) when valid case type is selected', async () => {
			const response = await request.post(`${baseUrl}/select-case-type`).send({
				caseType: 'Tree preservation order'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/submission-date`);
		});

		it('should return 400 with error message when no case type is selected', async () => {
			const response = await request.post(`${baseUrl}/select-case-type`).send({
				caseType: ''
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Select a case type');

			const fieldErrorMessage = parseHtml(response.text, {
				rootElement: '.govuk-error-message',
				skipPrettyPrint: true
			}).innerHTML;
			expect(fieldErrorMessage).toContain('Select a case type');
		});

		it('should return 400 with error message when an invalid case type is posted', async () => {
			const response = await request.post(`${baseUrl}/select-case-type`).send({
				caseType: 'Invalid appeal type'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Select a case type');
		});
	});
});
