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

	describe('GET /submission-date', () => {
		let pageHtml;

		beforeAll(async () => {
			const response = await request.get(`${baseUrl}/submission-date`);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should render the correct heading, caption, and title', () => {
			expect(pageHtml.querySelector('main h1')?.innerHTML.trim()).toBe(
				'What date was the appeal submitted?'
			);
			expect(pageHtml.querySelector('main .govuk-caption-l')?.innerHTML.trim()).toBe(
				'Create a case'
			);
		});

		it('should render hint text displaying a date no more than 3 days in the past', () => {
			const hint = pageHtml.querySelector('#submission-date-hint');
			expect(hint).not.toBeNull();

			const hintText = hint?.textContent?.trim() || '';
			expect(hintText).toMatch(/For example, \d{1,2} \d{1,2} \d{4}/);

			const match = hintText.match(/For example, (\d{1,2}) (\d{1,2}) (\d{4})/);
			expect(match).not.toBeNull();

			const [_, day, month, year] = match;
			const exampleDate = new Date(Number(year), Number(month) - 1, Number(day));
			const now = new Date();
			now.setHours(23, 59, 59, 999);

			const diffTime = now.getTime() - exampleDate.getTime();
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			expect(diffDays).toBeLessThanOrEqual(3);
			expect(diffDays).toBeGreaterThanOrEqual(0);
		});

		it('should render date inputs for day, month, and year', () => {
			expect(pageHtml.querySelector('input[name="submission-date-day"]')).not.toBeNull();
			expect(pageHtml.querySelector('input[name="submission-date-month"]')).not.toBeNull();
			expect(pageHtml.querySelector('input[name="submission-date-year"]')).not.toBeNull();
		});

		it('should render the Continue button', () => {
			const submitButton = pageHtml.querySelector('button[type="submit"]');
			expect(submitButton?.innerHTML.trim()).toBe('Continue');
		});

		it('should display a Back link navigating to Choose case type page (/select-case-type)', () => {
			const backLink = pageHtml.querySelector('.govuk-back-link');
			expect(backLink).not.toBeNull();
			expect(backLink.getAttribute('href')).toBe(`${baseUrl}/select-case-type`);
		});

		it('should highlight Create a case navigation tab in header', async () => {
			const response = await request.get(`${baseUrl}/submission-date`);
			const html = parseHtml(response.text, { rootElement: 'header' });

			const activeNavLink = html.querySelector(
				'.govuk-header__navigation-item--active a.govuk-header__link'
			);
			expect(activeNavLink?.getAttribute('href')).toBe('/appeals-service/create-a-case');
			expect(activeNavLink?.innerHTML.trim()).toBe('Create a case');
		});

		it('should persist and render previously entered date from session', async () => {
			await request.post(`${baseUrl}/submission-date`).send({
				'submission-date-day': '15',
				'submission-date-month': '6',
				'submission-date-year': '2023'
			});

			const response = await request.get(`${baseUrl}/submission-date`);
			const html = parseHtml(response.text);

			const dayInput = html.querySelector('input[name="submission-date-day"]');
			const monthInput = html.querySelector('input[name="submission-date-month"]');
			const yearInput = html.querySelector('input[name="submission-date-year"]');

			expect(dayInput.getAttribute('value')).toBe('15');
			expect(monthInput.getAttribute('value')).toBe('6');
			expect(yearInput.getAttribute('value')).toBe('2023');
		});
	});

	describe('POST /submission-date', () => {
		it('should redirect to check details page (/check-details) when a valid date is entered', async () => {
			const response = await request.post(`${baseUrl}/submission-date`).send({
				'submission-date-day': '10',
				'submission-date-month': '10',
				'submission-date-year': '2023'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/check-details`);
		});

		it('should return 400 with "Enter the appeal submitted date" when no date is entered', async () => {
			const response = await request.post(`${baseUrl}/submission-date`).send({
				'submission-date-day': '',
				'submission-date-month': '',
				'submission-date-year': ''
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter the appeal submitted date');

			const fieldErrorMessage = parseHtml(response.text, {
				rootElement: '.govuk-error-message',
				skipPrettyPrint: true
			}).innerHTML;
			expect(fieldErrorMessage).toContain('Enter the appeal submitted date');
		});

		it('should return 400 with "The appeal submitted date must be a real date" when an invalid date is entered', async () => {
			const invalidDateCases = [
				{
					'submission-date-day': '32',
					'submission-date-month': '1',
					'submission-date-year': '2023'
				},
				{
					'submission-date-day': '29',
					'submission-date-month': '2',
					'submission-date-year': '2023'
				},
				{
					'submission-date-day': 'invalid',
					'submission-date-month': '1',
					'submission-date-year': '2023'
				},
				{
					'submission-date-day': '1',
					'submission-date-month': '13',
					'submission-date-year': '2023'
				},
				{
					'submission-date-day': '1',
					'submission-date-month': '',
					'submission-date-year': '2023'
				}
			];

			for (const invalidData of invalidDateCases) {
				const response = await request.post(`${baseUrl}/submission-date`).send(invalidData);

				expect(response.statusCode).toBe(400);

				const errorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(errorSummaryHtml).toContain('There is a problem</h2>');
				expect(errorSummaryHtml).toContain('The appeal submitted date must be a real date');

				const fieldErrorMessage = parseHtml(response.text, {
					rootElement: '.govuk-error-message',
					skipPrettyPrint: true
				}).innerHTML;
				expect(fieldErrorMessage).toContain('The appeal submitted date must be a real date');
			}
		});
	});

	describe('GET /check-details', () => {
		beforeEach(async () => {
			await request.post(`${baseUrl}/select-case-type`).send({
				caseType: 'Tree preservation order'
			});
			await request.post(`${baseUrl}/submission-date`).send({
				'submission-date-day': '19',
				'submission-date-month': '9',
				'submission-date-year': '2026'
			});
		});

		it('should redirect to /select-case-type if session data is missing', async () => {
			await request.get(baseUrl);

			const response = await request.get(`${baseUrl}/check-details`);
			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/select-case-type`);
		});

		it('should render the correct heading, caption, and title', async () => {
			const response = await request.get(`${baseUrl}/check-details`);
			expect(response.statusCode).toBe(200);

			const pageHtml = parseHtml(response.text, { rootElement: 'body' });
			expect(pageHtml.querySelector('main h1')?.innerHTML.trim()).toBe(
				'Check details and create a new case'
			);
			expect(pageHtml.querySelector('main .govuk-caption-l')?.innerHTML.trim()).toBe(
				'Create a case'
			);
		});

		it('should render the summary list with selected case type and formatted date submitted', async () => {
			const response = await request.get(`${baseUrl}/check-details`);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });

			const summaryRows = pageHtml.querySelectorAll('.govuk-summary-list__row');
			expect(summaryRows.length).toBe(2);

			const caseTypeKey = summaryRows[0]
				.querySelector('.govuk-summary-list__key')
				?.innerHTML.trim();
			const caseTypeValue = summaryRows[0]
				.querySelector('.govuk-summary-list__value')
				?.innerHTML.trim();
			expect(caseTypeKey).toBe('Case type');
			expect(caseTypeValue).toBe('Tree preservation order');

			const dateKey = summaryRows[1].querySelector('.govuk-summary-list__key')?.innerHTML.trim();
			const dateValue = summaryRows[1]
				.querySelector('.govuk-summary-list__value')
				?.innerHTML.trim();
			expect(dateKey).toBe('Date submitted');
			expect(dateValue).toBe('19 September 2026');
		});

		it('should render change links pointing to the edit pages with editEntrypoint query', async () => {
			const response = await request.get(`${baseUrl}/check-details`);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });

			const summaryRows = pageHtml.querySelectorAll('.govuk-summary-list__row');
			const caseTypeAction = summaryRows[0].querySelector('.govuk-summary-list__actions a');
			const dateAction = summaryRows[1].querySelector('.govuk-summary-list__actions a');

			expect(caseTypeAction?.getAttribute('href')).toBe(
				`${baseUrl}/select-case-type?editEntrypoint=${encodeURIComponent(
					`${baseUrl}/select-case-type`
				)}`
			);
			expect(caseTypeAction?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Change case type');

			expect(dateAction?.getAttribute('href')).toBe(
				`${baseUrl}/submission-date?editEntrypoint=${encodeURIComponent(
					`${baseUrl}/submission-date`
				)}`
			);
			expect(dateAction?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Change date submitted');
		});

		it('should render a Back link navigating to the submission date page', async () => {
			const response = await request.get(`${baseUrl}/check-details`);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/submission-date`
			);
		});

		it('should render the Create case submit button', async () => {
			const response = await request.get(`${baseUrl}/check-details`);
			const pageHtml = parseHtml(response.text, { rootElement: 'body' });

			const submitButton = pageHtml.querySelector('button[type="submit"]');
			expect(submitButton?.innerHTML.trim()).toBe('Create case');
		});

		it('should highlight Create a case navigation tab in header', async () => {
			const response = await request.get(`${baseUrl}/check-details`);
			const html = parseHtml(response.text, { rootElement: 'header' });

			const activeNavLink = html.querySelector(
				'.govuk-header__navigation-item--active a.govuk-header__link'
			);
			expect(activeNavLink?.getAttribute('href')).toBe('/appeals-service/create-a-case');
			expect(activeNavLink?.innerHTML.trim()).toBe('Create a case');
		});
	});

	describe('editing answers via change links', () => {
		beforeEach(async () => {
			await request.post(`${baseUrl}/select-case-type`).send({
				caseType: 'Tree preservation order'
			});
			await request.post(`${baseUrl}/submission-date`).send({
				'submission-date-day': '19',
				'submission-date-month': '9',
				'submission-date-year': '2026'
			});
		});

		it('should allow changing the case type and return back to /check-details', async () => {
			const editUrl = `${baseUrl}/select-case-type?editEntrypoint=${encodeURIComponent(
				`${baseUrl}/select-case-type`
			)}`;

			const editPageRes = await request.get(editUrl);
			const editPageHtml = parseHtml(editPageRes.text, { rootElement: 'body' });

			expect(editPageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/check-details`
			);
			const tpoRadio = editPageHtml.querySelector('input[value="Tree preservation order"]');
			expect(tpoRadio.hasAttribute('checked')).toBe(true);

			const postEditRes = await request.post(editUrl).send({
				caseType: 'High hedges appeal'
			});
			expect(postEditRes.statusCode).toBe(302);
			expect(postEditRes.headers.location).toBe(`${baseUrl}/check-details`);

			const checkDetailsRes = await request.get(`${baseUrl}/check-details`);
			const checkDetailsHtml = parseHtml(checkDetailsRes.text, { rootElement: 'body' });
			const rows = checkDetailsHtml.querySelectorAll('.govuk-summary-list__row');
			expect(rows[0].querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
				'High hedges appeal'
			);
		});

		it('should allow changing the submission date and return back to /check-details', async () => {
			const editUrl = `${baseUrl}/submission-date?editEntrypoint=${encodeURIComponent(
				`${baseUrl}/submission-date`
			)}`;

			const editPageRes = await request.get(editUrl);
			const editPageHtml = parseHtml(editPageRes.text, { rootElement: 'body' });

			expect(editPageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/check-details`
			);
			expect(
				editPageHtml.querySelector('input[name="submission-date-day"]').getAttribute('value')
			).toBe('19');

			const postEditRes = await request.post(editUrl).send({
				'submission-date-day': '20',
				'submission-date-month': '9',
				'submission-date-year': '2026'
			});
			expect(postEditRes.statusCode).toBe(302);
			expect(postEditRes.headers.location).toBe(`${baseUrl}/check-details`);

			const checkDetailsRes = await request.get(`${baseUrl}/check-details`);
			const checkDetailsHtml = parseHtml(checkDetailsRes.text, { rootElement: 'body' });
			const rows = checkDetailsHtml.querySelectorAll('.govuk-summary-list__row');
			expect(rows[1].querySelector('.govuk-summary-list__value')?.innerHTML.trim()).toBe(
				'20 September 2026'
			);
		});
	});

	describe('POST /check-details', () => {
		beforeEach(async () => {
			await request.post(`${baseUrl}/select-case-type`).send({
				caseType: 'Tree preservation order'
			});
			await request.post(`${baseUrl}/submission-date`).send({
				'submission-date-day': '19',
				'submission-date-month': '9',
				'submission-date-year': '2026'
			});
		});

		it('should clear the session and redirect to the case details page placeholder', async () => {
			const response = await request.post(`${baseUrl}/check-details`);

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe('/appeals-service/appeal-details/1');

			// Check session was cleared
			const checkDetailsResponse = await request.get(`${baseUrl}/check-details`);
			expect(checkDetailsResponse.statusCode).toBe(302);
			expect(checkDetailsResponse.headers.location).toBe(`${baseUrl}/select-case-type`);
		});
	});
});
