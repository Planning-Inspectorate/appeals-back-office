// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('change procedure estimation', () => {
	const appealId = 2;

	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}`)
			.reply(200, { ...appealData, appealId, procedureType: 'inquiry' })
			.persist();
	});

	appealData.procedureType = 'inquiry';

	afterEach(teardown);

	describe('GET /change-appeal-procedure-type/inquiry/estimation', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, {
					...appealData,
					appealId,
					procedureType: 'inquiry'
				});

			appealData.procedureType = 'inquiry';

			// set session data with post request
			await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/Inquiry/estimation`)
				.send({
					estimationYesNo: 'yes',
					estimationDays: 8
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/change-appeal-procedure-type/Inquiry/estimation`
			);
			pageHtml = parseHtml(response.text, { skipPrettyPrint: true });
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Do you know the expected number of days to carry out the inquiry?'
			);
		});

		it('should render a radio button for inquiry estimation', () => {
			expect(pageHtml.querySelector('input[name="estimationYesNo"]')).not.toBeNull();
		});

		it('should render an input for inquiry estimation days', () => {
			expect(pageHtml.querySelector('input[name="estimationDays"]')).not.toBeNull();
		});

		it('should render correct values when session is set', () => {
			expect(pageHtml.innerHTML).toContain(
				`name="estimationYesNo" type="radio" value="yes" checked`
			);
			expect(pageHtml.innerHTML).toContain(
				`id="estimation-days" name="estimationDays" type="text" value="8"`
			);
		});
	});

	describe('POST /change-appeal-procedure-type/inquiry/estimation', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /change-appeal-procedure-type/inquiry/address when answering no', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/estimation`)
				.send({
					estimationYesNo: 'no'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/address-known`
			);
		});

		it('should redirect to /change-appeal-procedure-type/inquiry/address when answering yes', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/estimation`)
				.send({
					estimationYesNo: 'yes',
					estimationDays: 12
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/address-known`
			);
		});

		it('should return 400 on missing inquiryEstimationYesNo with appropriate error message', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/estimation`)
				.send({});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Select yes if you know the expected number of days to carry out the inquiry'
			);
		});

		it('should return an appropriate error message when symbols are input', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/estimation`)
				.send({
					estimationYesNo: 'yes',
					estimationDays: '%%%----££££'
				});

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter the number of days using numbers 0 to 99');
		});

		it('should return an appropriate error message when an incorrect number value is posted', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/estimation`)
				.send({
					estimationYesNo: 'yes',
					estimationDays: '0.1'
				});

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Number of days must be a whole or half number, like 3 or 3.5'
			);
		});
	});
});
