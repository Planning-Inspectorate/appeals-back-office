// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { behavesLikeAddressForm } from '#testing/app/shared-examples/address-form.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('set up inquiry', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /inquiry/setup', () => {
		// eslint-disable-next-line jest/expect-expect
		it('should redirect to /inquiry/setup/date', () => {
			return new Promise((resolve) => {
				request
					.get(`${baseUrl}/2/inquiry/setup`)
					.expect(302)
					.expect('Location', `${baseUrl}/2/inquiry/setup/date`)
					.end(resolve);
			});
		});
	});

	describe('GET /inquiry/setup/date', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/date`);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Inquiry date and time');
		});

		it('should render a Date field', () => {
			expect(pageHtml.querySelector('input#inquiry-date-day')).not.toBeNull();
			expect(pageHtml.querySelector('input#inquiry-date-month')).not.toBeNull();
			expect(pageHtml.querySelector('input#inquiry-date-year')).not.toBeNull();
		});

		it('should render a Time field', () => {
			expect(pageHtml.querySelector('input#inquiry-time-hour')).not.toBeNull();
			expect(pageHtml.querySelector('input#inquiry-time-minute')).not.toBeNull();
		});

		it('should render any saved response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealData, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send({
				'inquiry-date-day': '01',
				'inquiry-date-month': '02',
				'inquiry-date-year': '3025',
				'inquiry-time-hour': '12',
				'inquiry-time-minute': '00'
			});

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/date`);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#inquiry-date-day').getAttribute('value')).toEqual('01');
			expect(pageHtml.querySelector('input#inquiry-date-month').getAttribute('value')).toEqual(
				'02'
			);
			expect(pageHtml.querySelector('input#inquiry-date-year').getAttribute('value')).toEqual(
				'3025'
			);
			expect(pageHtml.querySelector('input#inquiry-time-hour').getAttribute('value')).toEqual('12');
			expect(pageHtml.querySelector('input#inquiry-time-minute').getAttribute('value')).toEqual(
				'00'
			);
		});
	});

	describe('POST /inquiry/setup/date', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /inquiry/setup/address with valid inputs', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send({
				'inquiry-date-day': '01',
				'inquiry-date-month': '02',
				'inquiry-date-year': '3025',
				'inquiry-time-hour': '12',
				'inquiry-time-minute': '00'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/inquiry/setup/estimation`);
		});

		it('should return 400 on invalid date with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send({
				'inquiry-date-day': '31',
				'inquiry-date-month': '02',
				'inquiry-date-year': '2025',
				'inquiry-time-hour': '12',
				'inquiry-time-minute': '00'
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
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send({
				'inquiry-time-hour': '12',
				'inquiry-time-minute': '00'
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
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send({
				'inquiry-date-day': '28',
				'inquiry-date-month': '02',
				'inquiry-date-year': '1999',
				'inquiry-time-hour': '12',
				'inquiry-time-minute': '00'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('The inquiry date must be in the future');
		});

		it('should return 400 on invalid time with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send({
				'inquiry-date-day': '28',
				'inquiry-date-month': '02',
				'inquiry-date-year': '3025',
				'inquiry-time-hour': '99',
				'inquiry-time-minute': '99'
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
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send({
				'inquiry-date-day': '28',
				'inquiry-date-month': '02',
				'inquiry-date-year': '3025'
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

	describe('GET /inquiry/setup/estimation', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealData, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/Inquiry/setup/estimation`).send({
				inquiryEstimationYesNo: 'yes'
			});

			const response = await request.get(`${baseUrl}/${appealId}/Inquiry/setup/estimation`);
			pageHtml = parseHtml(response.text);
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
			expect(pageHtml.querySelector('input[name="inquiryEstimationYesNo"]')).not.toBeNull();
		});

		it('should render an input for inquiry estimation days', () => {
			expect(pageHtml.querySelector('input[name="inquiryEstimationDays"]')).not.toBeNull();
		});
	});

	describe('POST /inquiry/setup/estimation', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /Inquiry/setup/address when answering no', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/Inquiry/setup/estimation`).send({
				inquiryEstimationYesNo: 'no'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/inquiry/setup/address`);
		});

		it('should redirect to /Inquiry/setup/address when answering yes', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/Inquiry/setup/estimation`).send({
				inquiryEstimationYesNo: 'yes',
				inquiryEstimationDays: 12
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/inquiry/setup/address`);
		});

		it('should return 400 on missing inquiryEstimationYesNo with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/Inquiry/setup/address`).send({});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Select yes if you know the address of where the inquiry will take place'
			);
		});
	});

	describe('GET /inquiry/setup/address', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealData, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/Inquiry/setup/address`).send({
				addressKnown: 'yes'
			});

			const response = await request.get(`${baseUrl}/${appealId}/Inquiry/setup/address`);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Do you know the address of where the inquiry will take place?'
			);
		});

		it('should render a radio button for address known', () => {
			expect(pageHtml.querySelector('input[name="addressKnown"]')).not.toBeNull();
		});

		it('should render a radio button for address unknown', () => {
			expect(pageHtml.querySelector('input[name="addressKnown"]')).not.toBeNull();
		});

		it('should check the submitted value', () => {
			expect(
				pageHtml.querySelector('input[name="addressKnown"][value="yes"]')?.getAttribute('checked')
			).toBeDefined();
		});
	});

	describe('POST /inquiry/setup/address', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /inquiry/setup/timetable-due-dates when answering no', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/Inquiry/setup/address`).send({
				addressKnown: 'no'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/timetable-due-dates`
			);
		});

		it('should redirect to /Inquiry/setup/address-details when answering yes', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/Inquiry/setup/address`).send({
				addressKnown: 'yes'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/address-details`
			);
		});

		it('should return 400 on missing addressKnown with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/Inquiry/setup/address`).send({});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Select yes if you know the address of where the inquiry will take place'
			);
		});
	});

	describe('GET /inquiry/setup/address-details', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/Inquiry/setup/address-details`);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Inquiry address');
		});

		it('should render a text input for address line 1', () => {
			expect(pageHtml.querySelector('input[name="addressLine1"]')).not.toBeNull();
		});

		it('should render a text input for address line 2', () => {
			expect(pageHtml.querySelector('input[name="addressLine2"]')).not.toBeNull();
		});

		it('should render a text input for town', () => {
			expect(pageHtml.querySelector('input[name="town"]')).not.toBeNull();
		});

		it('should render a text input for county', () => {
			expect(pageHtml.querySelector('input[name="county"]')).not.toBeNull();
		});

		it('should render a text input for postcode', () => {
			expect(pageHtml.querySelector('input[name="postCode"]')).not.toBeNull();
		});
	});

	describe('POST /inquiry/setup/address-details', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /Inquiry/setup/timetable-due-dates with valid inputs', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/Inquiry/setup/address-details`)
				.send({
					addressLine1: 'Flat 9',
					addressLine2: '123 Gerbil Drive',
					town: 'Blarberton',
					county: 'Slabshire',
					postCode: 'X25 3YZ'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/timetable-due-dates`
			);
		});

		behavesLikeAddressForm({
			request,
			url: `${baseUrl}/${appealId}/Inquiry/setup/address-details`
		});
	});
});
