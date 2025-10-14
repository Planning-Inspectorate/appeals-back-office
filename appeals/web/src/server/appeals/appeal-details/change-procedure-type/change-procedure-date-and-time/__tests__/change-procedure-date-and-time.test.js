// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('change to inquiry date and time', () => {
	const appealId = 2;

	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}`)
			.reply(200, { ...appealData, appealId })
			.persist();
	});

	afterEach(teardown);

	describe('GET /change-appeal-procedure-type/inquiry/date', () => {
		const appealId = 7;
		const savedDate = {
			'event-date-day': '19',
			'event-date-month': '03',
			'event-date-year': '2026',
			'event-time-hour': '10',
			'event-time-minute': '00'
		};

		let pageHtml;
		beforeAll(async () => {
			// Mock API call for the appeal
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId, procedureType: 'inquiry' });

			appealData.procedureType = 'inquiry';

			// Save inquiry data for this appealId
			await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/date`)
				.send(savedDate);

			//fetch page
			const response = await request.get(
				`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/date`
			);
			pageHtml = parseHtml(response.text);
		});

		it('renders the saved inquiry date scoped by appealId', async () => {
			expect(pageHtml.querySelector('input#event-date-day').getAttribute('value')).toBe('19');
			expect(pageHtml.querySelector('input#event-date-month').getAttribute('value')).toBe('03');
			expect(pageHtml.querySelector('input#event-date-year').getAttribute('value')).toBe('2026');
			expect(pageHtml.querySelector('input#event-time-hour').getAttribute('value')).toBe('10');
			expect(pageHtml.querySelector('input#event-time-minute').getAttribute('value')).toBe('00');
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Inquiry date and time');
		});

		it('should render a Date field', () => {
			expect(pageHtml.querySelector('input#event-date-day')).not.toBeNull();
			expect(pageHtml.querySelector('input#event-date-month')).not.toBeNull();
			expect(pageHtml.querySelector('input#event-date-year')).not.toBeNull();
		});

		it('should render a Time field', () => {
			expect(pageHtml.querySelector('input#event-time-hour')).not.toBeNull();
			expect(pageHtml.querySelector('input#event-time-minute')).not.toBeNull();
		});
	});

	describe('POST /change-appeal-procedure-type/inquiry/date', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should redirect to /change-appeal-procedure-type/inquiry/estimation with valid inputs', async () => {
			const monthVariants = ['02', 'Feb', 'February'];

			for (const month of monthVariants) {
				const response = await request
					.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/date`)
					.send({
						'event-date-day': '01',
						'event-date-month': month,
						'event-date-year': '3025',
						'event-time-hour': '12',
						'event-time-minute': '00'
					});

				expect(response.statusCode).toBe(302);
				expect(response.headers.location).toBe(
					`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/estimation`
				);
			}
		});

		it('should return 400 on invalid date with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/date`)
				.send({
					'event-date-day': '31',
					'event-date-month': '02',
					'event-date-year': '2025',
					'event-time-hour': '12',
					'event-time-minute': '00'
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Inquiry date must be a real date');
		});

		it('should return 400 on missing date with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/date`)
				.send({
					'event-time-hour': '12',
					'event-time-minute': '00'
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter the inquiry date');
		});

		it('should return 400 on date in the past with appropriate error message', async () => {
			const monthVariants = ['02', 'February', 'Feb'];

			for (const month of monthVariants) {
				const response = await request
					.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/date`)
					.send({
						'event-date-day': '28',
						'event-date-month': month,
						'event-date-year': '1999',
						'event-time-hour': '12',
						'event-time-minute': '00'
					});

				expect(response.statusCode).toBe(400);
				const errorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(errorSummaryHtml).toContain('There is a problem</h2>');
				expect(errorSummaryHtml).toContain('The inquiry date must be in the future');
			}
		});

		it('should return 400 on invalid time with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/date`)
				.send({
					'event-date-day': '28',
					'event-date-month': '02',
					'event-date-year': '3025',
					'event-time-hour': '99',
					'event-time-minute': '99'
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a real inquiry time');
		});

		it('should return 400 on missing time with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/date`)
				.send({
					'event-date-day': '28',
					'event-date-month': '02',
					'event-date-year': '3025'
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter the inquiry time');
		});
	});
});
