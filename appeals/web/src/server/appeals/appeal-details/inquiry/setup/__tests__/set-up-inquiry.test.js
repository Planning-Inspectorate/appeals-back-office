// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { behavesLikeAddressForm } from '#testing/app/shared-examples/address-form.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('set up inquiry', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});

	const appealId = 2;
	const validData = {
		planningObligation: {
			hasObligation: true
		}
	};
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}?include=all`)
			.reply(200, { ...appealData, appealId })
			.persist();

		nock('http://test/')
			.get(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
			.reply(200, {
				...validData
			})
			.persist();
	});

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
		const appealId = 7;
		const savedDate = {
			'inquiry-date-day': '19',
			'inquiry-date-month': '03',
			'inquiry-date-year': '2096',
			'inquiry-time-hour': '10',
			'inquiry-time-minute': '00'
		};

		let pageHtml;
		beforeAll(async () => {
			// Mock API call for the appeal
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			// Save inquiry data for this appealId
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send(savedDate);

			//fetch page
			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/date`);
			pageHtml = parseHtml(response.text);
		});

		it('renders the saved inquiry date scoped by appealId', async () => {
			expect(pageHtml.querySelector('input#inquiry-date-day').getAttribute('value')).toBe('19');
			expect(pageHtml.querySelector('input#inquiry-date-month').getAttribute('value')).toBe('03');
			expect(pageHtml.querySelector('input#inquiry-date-year').getAttribute('value')).toBe('2096');
			expect(pageHtml.querySelector('input#inquiry-time-hour').getAttribute('value')).toBe('10');
			expect(pageHtml.querySelector('input#inquiry-time-minute').getAttribute('value')).toBe('00');
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

		it('should have a back link to the case details page', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/date`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}`
			);
		});

		it('should have a back link to the original page if specified', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/date?backUrl=/my-cases`
			);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe('/my-cases');
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F7%2Finquiry%2Fsetup%2Fdate`;
			const response = await request.get(`${baseUrl}/7/inquiry/setup/date${queryString}`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/check-details`
			);
		});
	});

	describe('GET /inquiry/setup/date setup inquiry', () => {
		const appealId = 7;
		const savedDate = {
			'inquiry-date-day': '19',
			'inquiry-date-month': '03',
			'inquiry-date-year': '2096',
			'inquiry-time-hour': '10',
			'inquiry-time-minute': '00'
		};

		let pageHtml;
		beforeAll(async () => {
			// Mock API call for the appeal
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId, procedureType: 'inquiry' });

			// Save inquiry data for this appealId
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send(savedDate);

			//fetch page
			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/date`);
			pageHtml = parseHtml(response.text);
		});

		it('renders the saved inquiry date scoped by appealId', async () => {
			expect(pageHtml.querySelector('input#inquiry-date-day').getAttribute('value')).toBe('19');
			expect(pageHtml.querySelector('input#inquiry-date-month').getAttribute('value')).toBe('03');
			expect(pageHtml.querySelector('input#inquiry-date-year').getAttribute('value')).toBe('2096');
			expect(pageHtml.querySelector('input#inquiry-time-hour').getAttribute('value')).toBe('10');
			expect(pageHtml.querySelector('input#inquiry-time-minute').getAttribute('value')).toBe('00');
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

		it('should have a back link to the case details page', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/date`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}`
			);
		});

		it('should have a back link to the original page if specified', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/date?backUrl=/my-cases`
			);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe('/my-cases');
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F7%2Finquiry%2Fsetup%2Fdate`;
			const response = await request.get(`${baseUrl}/7/inquiry/setup/date${queryString}`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/check-details`
			);
		});
	});

	describe('POST /inquiry/setup/date', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should redirect to /inquiry/setup/address with valid inputs', async () => {
			const monthVariants = ['02', 'Feb', 'February'];

			for (const month of monthVariants) {
				const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send({
					'inquiry-date-day': '01',
					'inquiry-date-month': month,
					'inquiry-date-year': '3025',
					'inquiry-time-hour': '12',
					'inquiry-time-minute': '00'
				});

				expect(response.statusCode).toBe(302);
				expect(response.headers.location).toBe(`${baseUrl}/${appealId}/inquiry/setup/estimation`);
			}
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
			const monthVariants = ['02', 'February', 'Feb'];

			for (const month of monthVariants) {
				const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send({
					'inquiry-date-day': '28',
					'inquiry-date-month': month,
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
			}
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
				.get(`/appeals/${appealId}?include=all`)
				.twice()
				.reply(200, { ...appealData, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/Inquiry/setup/estimation`).send({
				inquiryEstimationYesNo: 'yes',
				inquiryEstimationDays: 8
			});

			const response = await request.get(`${baseUrl}/${appealId}/Inquiry/setup/estimation`);
			pageHtml = parseHtml(response.text, { skipPrettyPrint: true });
		});
		afterEach(() => {
			nock.cleanAll();
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

		it('should render correct values when session is set', () => {
			expect(pageHtml.innerHTML).toContain(
				`name="inquiryEstimationYesNo" type="radio" value="yes" checked`
			);
			expect(pageHtml.innerHTML).toContain(
				`id="inquiry-estimation-days" name="inquiryEstimationDays" type="text" value="8"`
			);
		});

		it('should have a back link to the previous page', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/estimation`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/date`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Festimation`;
			const response = await request.get(`${baseUrl}/2/inquiry/setup/estimation${queryString}`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/check-details`
			);
		});

		it('should have a back link to the previous page if editing began on another page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/estimation?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Fdate`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/date?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Fdate`
			);
		});
	});

	describe('POST /inquiry/setup/estimation', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
		});
		afterEach(() => {
			nock.cleanAll();
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
			const response = await request
				.post(`${baseUrl}/${appealId}/Inquiry/setup/estimation`)
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
			const response = await request.post(`${baseUrl}/${appealId}/Inquiry/setup/estimation`).send({
				inquiryEstimationYesNo: 'yes',
				inquiryEstimationDays: '%%%----££££'
			});

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter the number of days using numbers 0 to 99');
		});

		it('should return an appropriate error message when an incorrect number value is posted', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/Inquiry/setup/estimation`).send({
				inquiryEstimationYesNo: 'yes',
				inquiryEstimationDays: '0.1'
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

	describe('GET /inquiry/setup/address', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.twice()
				.reply(200, { ...appealData, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/Inquiry/setup/address`).send({
				addressKnown: 'yes'
			});

			const response = await request.get(`${baseUrl}/${appealId}/Inquiry/setup/address`);
			pageHtml = parseHtml(response.text);
		});
		afterEach(() => {
			nock.cleanAll();
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

		it('should have a back link to the previous page', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/address`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/estimation`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Faddress`;
			const response = await request.get(`${baseUrl}/2/inquiry/setup/address${queryString}`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/check-details`
			);
		});

		it('should have a back link to the previous page if editing began on another page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Festimation`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/estimation?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Festimation`
			);
		});
	});

	describe('GET /inquiry/setup/address setup inquiry', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.twice()
				.reply(200, { ...appealData, appealId, procedureType: 'inquiry' });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/Inquiry/setup/address`).send({
				addressKnown: 'yes'
			});

			const response = await request.get(`${baseUrl}/${appealId}/Inquiry/setup/address`);
			pageHtml = parseHtml(response.text);
		});
		afterAll(() => {
			nock.cleanAll();
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

		it('should have a back link to the previous page', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/address`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/estimation`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Faddress`;
			const response = await request.get(`${baseUrl}/2/inquiry/setup/address${queryString}`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/check-details`
			);
		});

		it('should have a back link to the previous page if editing began on another page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Festimation`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/estimation?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Festimation`
			);
		});
	});

	describe('POST /inquiry/setup/address', () => {
		const appealId = 2;

		afterEach(() => {
			nock.cleanAll();
		});

		describe('when starting a case', () => {
			beforeEach(async () => {
				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, { ...appealData, appealId, procedureType: '' });
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
		});

		describe('when not starting a case', () => {
			beforeEach(async () => {
				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, { ...appealData, appealId, procedureType: 'inquiry' });
			});

			it('should redirect to /inquiry/setup/check-details when answering no', async () => {
				const response = await request.post(`${baseUrl}/${appealId}/Inquiry/setup/address`).send({
					addressKnown: 'no'
				});

				expect(response.statusCode).toBe(302);
				expect(response.headers.location).toBe(
					`${baseUrl}/${appealId}/inquiry/setup/check-details`
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
		});

		it('should return 400 on missing addressKnown with appropriate error message', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

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
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/Inquiry/setup/address-details`);
			pageHtml = parseHtml(response.text);
		});
		afterEach(() => {
			nock.cleanAll();
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

		it('should have a back link to the previous page', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/address-details`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/address`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Faddress-details`;
			const response = await request.get(
				`${baseUrl}/2/inquiry/setup/address-details${queryString}`
			);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/check-details`
			);
		});

		it('should have a back link to the previous page if editing began on another page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/address-details?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Faddress`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Faddress`
			);
		});
	});

	describe('POST /inquiry/setup/address-details', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
		});

		afterEach(() => {
			nock.cleanAll();
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

	describe('POST /inquiry/setup/address-details on setup inquiry', () => {
		const appealId = 2;

		beforeAll(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId, procedureType: 'inquiry' });
		});

		afterAll(() => {
			nock.cleanAll();
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
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/inquiry/setup/check-details`);
		});

		behavesLikeAddressForm({
			request,
			url: `${baseUrl}/${appealId}/Inquiry/setup/address-details`
		});
	});

	describe('GET /inquiry/setup/timetable-due-dates', () => {
		const appealId = 2;
		const validData = {
			planningObligation: {
				hasObligation: true
			}
		};
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...validData
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/timetable-due-dates`
			);
			pageHtml = parseHtml(response.text);
		});

		afterEach(teardown);

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Timetable due dates');
		});

		it('should render a date input for LPA questionnaire date', () => {
			expect(pageHtml.querySelector('input#lpa-questionnaire-due-date-day')).not.toBeNull();
			expect(pageHtml.querySelector('input#lpa-questionnaire-due-date-month')).not.toBeNull();
			expect(pageHtml.querySelector('input#lpa-questionnaire-due-date-year')).not.toBeNull();
		});

		it('should render a date input for statements date', () => {
			expect(pageHtml.querySelector('input#statement-due-date-day')).not.toBeNull();
			expect(pageHtml.querySelector('input#statement-due-date-month')).not.toBeNull();
			expect(pageHtml.querySelector('input#statement-due-date-year')).not.toBeNull();
		});

		it('should render a date input for IP comments date', () => {
			expect(pageHtml.querySelector('input#ip-comments-due-date-day')).not.toBeNull();
			expect(pageHtml.querySelector('input#ip-comments-due-date-month')).not.toBeNull();
			expect(pageHtml.querySelector('input#ip-comments-due-date-year')).not.toBeNull();
		});

		it('should render a date input for statement of common ground date', () => {
			expect(
				pageHtml.querySelector('input#statement-of-common-ground-due-date-day')
			).not.toBeNull();
			expect(
				pageHtml.querySelector('input#statement-of-common-ground-due-date-month')
			).not.toBeNull();
			expect(
				pageHtml.querySelector('input#statement-of-common-ground-due-date-year')
			).not.toBeNull();
		});

		it('should render a date input for proof of evidence and witnesses date', () => {
			expect(
				pageHtml.querySelector('input#proof-of-evidence-and-witnesses-due-date-day')
			).not.toBeNull();
			expect(
				pageHtml.querySelector('input#proof-of-evidence-and-witnesses-due-date-month')
			).not.toBeNull();
			expect(
				pageHtml.querySelector('input#proof-of-evidence-and-witnesses-due-date-year')
			).not.toBeNull();
		});

		it('should render a date input for planning obligation date', () => {
			expect(pageHtml.querySelector('input#planning-obligation-due-date-day')).not.toBeNull();
			expect(pageHtml.querySelector('input#planning-obligation-due-date-month')).not.toBeNull();
			expect(pageHtml.querySelector('input#planning-obligation-due-date-year')).not.toBeNull();
		});

		it('should have a back link to the address page when address is known', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.times(5)
				.reply(200, { ...appealData, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send({
				'inquiry-date-day': '01',
				'inquiry-date-month': '02',
				'inquiry-date-year': '3025',
				'inquiry-time-hour': '12',
				'inquiry-time-minute': '00'
			});
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/estimation`).send({
				inquiryEstimationYesNo: 'yes',
				inquiryEstimationDays: 12
			});
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/address`).send({
				addressKnown: 'yes'
			});
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/address-details`).send({
				addressLine1: 'Flat 9',
				addressLine2: '123 Gerbil Drive',
				town: 'Blarberton',
				county: 'Slabshire',
				postCode: 'X25 3YZ'
			});

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/timetable-due-dates`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/address-details`
			);
		});

		it('should have a back link to the address known page if address is not known', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.times(4)
				.reply(200, { ...appealData, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send({
				'inquiry-date-day': '01',
				'inquiry-date-month': '02',
				'inquiry-date-year': '3025',
				'inquiry-time-hour': '12',
				'inquiry-time-minute': '00'
			});
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/estimation`).send({
				inquiryEstimationYesNo: 'yes',
				inquiryEstimationDays: 12
			});
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/address`).send({
				addressKnown: 'no'
			});

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/timetable-due-dates`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/address`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Ftimetable-due-dates`;
			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/timetable-due-dates${queryString}`
			);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/check-details`
			);
		});

		it('should have a back link to the address details page if editing began on another page and address is known', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.twice()
				.reply(200, { ...appealData, appealId });

			await request.post(`${baseUrl}/${appealId}/inquiry/setup/address`).send({
				addressKnown: 'yes'
			});

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/timetable-due-dates?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Fdate`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/address-details?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Fdate`
			);
		});

		it('should have a back link to the address known page if editing began on another page and address is not known', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.twice()
				.reply(200, { ...appealData, appealId });

			await request.post(`${baseUrl}/${appealId}/inquiry/setup/address`).send({
				addressKnown: 'no'
			});

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/timetable-due-dates?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Fdate`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/setup/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fsetup%2Fdate`
			);
		});
	});

	describe('GET /inquiry/setup/timetable-due-dates when hasObligation is false', () => {
		let pageHtml;
		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					planningObligation: { hasObligation: false }
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/setup/timetable-due-dates`
			);
			pageHtml = parseHtml(response.text);
		});

		it('should not render a date input for planning obligation date when no planning obligation is present', () => {
			expect(pageHtml.querySelector('input#planning-obligation-due-date-day')).toBeNull();
			expect(pageHtml.querySelector('input#planning-obligation-due-date-month')).toBeNull();
			expect(pageHtml.querySelector('input#planning-obligation-due-date-year')).toBeNull();
		});
	});

	describe('POST /inquiry/setup/timetable-due-dates', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...validData
				});
		});

		it('should return 400 with an error when all fields are blank', async () => {
			const appealId = 2;
			// Use a clearly past date
			const response = await request
				.post(`${baseUrl}/${appealId}/inquiry/setup/timetable-due-dates`)
				.send({});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter timetable due dates');
		});

		it('should return 400 with an error when statement due date is in the past', async () => {
			const appealId = 2;
			// Use a clearly past date
			const response = await request
				.post(`${baseUrl}/${appealId}/Inquiry/setup/timetable-due-dates`)
				.send({
					'statement-due-date-day': '01',
					'statement-due-date-month': '01',
					'statement-due-date-year': '2000'
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('statement due date must be in the future');
		});

		it('should return 400 with an error when incorrect date is entered', async () => {
			const appealId = 2;
			// Use a clearly past date
			const response = await request
				.post(`${baseUrl}/${appealId}/Inquiry/setup/timetable-due-dates`)
				.send({
					'statement-due-date-day': '32',
					'statement-due-date-month': '12',
					'statement-due-date-year': '2000'
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Statement due date day must be between 1 and 31');
		});

		it('should return 400 with an error when a non-business day is entered', async () => {
			const appealId = 2;
			// Use a clearly past date
			const response = await request
				.post(`${baseUrl}/${appealId}/Inquiry/setup/timetable-due-dates`)
				.send({
					'statement-due-date-day': '25',
					'statement-due-date-month': '12',
					'statement-due-date-year': '2040'
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('The statement due date must be a business day');
		});

		it('should return 400 with a specific date field error when full date is not entered', async () => {
			const appealId = 2;
			// Use a clearly past date
			const response = await request
				.post(`${baseUrl}/${appealId}/Inquiry/setup/timetable-due-dates`)
				.send({
					'statement-due-date-day': '01',
					'statement-due-date-month': '01',
					'lpa-questionnaire-due-date-year': '2025',
					'lpa-questionnaire-due-date-day': '01',
					'planning-obligation-due-date-month': '01',
					'planning-obligation-due-date-year': '2025'
				});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Statement due date must include a year');
			expect(errorSummaryHtml).toContain('LPA questionnaire due date must include a month');
			expect(errorSummaryHtml).toContain('Planning obligation due date must include a day');
			expect(errorSummaryHtml).toContain('Enter the statement of common ground due date');
			expect(errorSummaryHtml).toContain('Enter the proof of evidence and witnesses due date');
			expect(errorSummaryHtml).toContain('Enter the case management conference due date');
		});
	});

	describe('GET /inquiry/setup/check-details', () => {
		const appealId = 1;
		const dateValues = {
			'inquiry-date-day': '01',
			'inquiry-date-month': '02',
			'inquiry-date-year': '3025',
			'inquiry-time-hour': '12',
			'inquiry-time-minute': '00'
		};
		const addressValues = {
			addressLine1: 'Flat 9',
			addressLine2: '123 Gerbil Drive',
			town: 'Blarberton',
			county: 'Slabshire',
			postCode: 'X25 3YZ'
		};
		const estimationValue = {
			inquiryEstimationDays: '10'
		};
		const validData = {
			planningObligation: {
				hasObligation: true
			}
		};

		let pageHtml;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...validData
				});

			nock('http://test/')
				.post('/appeals/${appealId}/appeal-timetables/notify-preview', {
					procedureType: 'inquiry',
					inquiry: {}
				})
				.reply(200, {
					appellant: 'Rendered HTML for appellant preview',
					lpa: 'Rendered HTML for LPA preview'
				});

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/start-case/select-procedure`).send({
				appealProcedure: 'inquiry'
			});
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/inquiry/setup/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/inquiry/setup/address-details`)
				.send(addressValues);
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/estimation`).send(estimationValue);

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/check-details`);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Check details and start case');
		});

		it('should render the correct date', () => {
			expect(pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[1]?.innerHTML.trim()).toBe(
				'1 February 3025'
			);
		});

		it('should render the correct time', () => {
			expect(pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[2]?.innerHTML.trim()).toBe(
				'12:00pm'
			);
		});

		it('should render the correct yes or no answer', () => {
			expect(pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[0]?.innerHTML.trim()).toBe(
				'Inquiry'
			);
		});

		it('should render the correct address', () => {
			expect(
				pageHtml
					.querySelectorAll('dd.govuk-summary-list__value')?.[5]
					?.innerHTML.split('<br>')
					.map((line) => line.trim())
			).toEqual(['Flat 9', '123 Gerbil Drive', 'Blarberton', 'Slabshire', 'X25 3YZ']);
		});

		it('should render the correct button text', () => {
			expect(pageHtml.querySelector('button')?.innerHTML.trim()).toBe('Start case');
		});
	});

	describe('GET /inquiry/setup/check-details on setup inquiry', () => {
		const appealId = 1;
		const dateValues = {
			'inquiry-date-day': '01',
			'inquiry-date-month': '02',
			'inquiry-date-year': '3025',
			'inquiry-time-hour': '12',
			'inquiry-time-minute': '00'
		};
		const addressValues = {
			addressLine1: 'Flat 9',
			addressLine2: '123 Gerbil Drive',
			town: 'Blarberton',
			county: 'Slabshire',
			postCode: 'X25 3YZ'
		};
		const estimationValue = {
			inquiryEstimationDays: '10'
		};
		const validData = {
			planningObligation: {
				hasObligation: true
			}
		};

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.times(5)
				.reply(200, { ...appealData, appealId, procedureType: 'inquiry' });

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...validData
				});

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/inquiry/setup/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/inquiry/setup/address-details`)
				.send(addressValues);
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/estimation`).send(estimationValue);

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/setup/check-details`);
			pageHtml = parseHtml(response.text);
		});

		afterAll(() => {
			nock.cleanAll();
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Check details and set up inquiry'
			);
		});

		it('should render the correct date', () => {
			expect(pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[0]?.innerHTML.trim()).toBe(
				'1 February 3025'
			);
		});

		it('should render the correct time', () => {
			expect(pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[1]?.innerHTML.trim()).toBe(
				'12:00pm'
			);
		});

		it('should render the correct yes or no answer', () => {
			expect(
				pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[0]?.innerHTML.trim()
			).not.toBe('Inquiry');
		});

		it('should render the correct address', () => {
			expect(
				pageHtml
					.querySelectorAll('dd.govuk-summary-list__value')?.[4]
					?.innerHTML.split('<br>')
					.map((line) => line.trim())
			).toEqual(['Flat 9', '123 Gerbil Drive', 'Blarberton', 'Slabshire', 'X25 3YZ']);
		});

		it('should render the correct button text', () => {
			expect(pageHtml.querySelector('button')?.innerHTML.trim()).toBe('Set up inquiry');
		});
	});

	describe('POST /inquiry/setup/check-details', () => {
		const appealId = 1;
		const validData = {
			planningObligation: {
				hasObligation: true
			}
		};
		const dateValues = {
			'inquiry-date-day': '01',
			'inquiry-date-month': '02',
			'inquiry-date-year': '3025',
			'inquiry-time-hour': '12',
			'inquiry-time-minute': '00'
		};
		const addressValues = {
			addressLine1: 'Flat 9',
			addressLine2: '123 Gerbil Drive',
			town: 'Blarberton',
			county: 'Slabshire',
			postCode: 'X25 3YZ'
		};
		const estimationValue = {
			inquiryEstimationDays: '10'
		};

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...validData
				})
				.persist();

			nock('http://test/').post(`/appeals/${appealId}/appeal-timetables`).reply(200);
			nock('http://test/').post(`/appeals/${appealId}/inquiry-estimates`).reply(200);
		});

		afterEach(teardown);

		it('should redirect to appeal details page after submission with address', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/inquiry`, (body) => {
					// Assert required fields exist
					expect(body).toHaveProperty('startDate');
					expect(body).toHaveProperty('inquiryStartTime');
					expect(body).toHaveProperty('lpaQuestionnaireDueDate');
					expect(body).toHaveProperty('statementDueDate');
					expect(body).toHaveProperty('ipCommentsDueDate');
					expect(body).toHaveProperty('statementOfCommonGroundDueDate');
					expect(body).toHaveProperty('proofOfEvidenceAndWitnessesDueDate');
					expect(body).toHaveProperty('caseManagementConferenceDueDate');
					expect(body).toHaveProperty('planningObligationDueDate');
					return true; // IMPORTANT: return true to match
				})
				.reply(201, { inquiryId: 1 });

			await request.post(`${baseUrl}/${appealId}/start-case/select-procedure`).send({
				appealProcedure: 'inquiry'
			});
			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/inquiry/setup/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/inquiry/setup/address-details`)
				.send(addressValues);
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/estimation`).send(estimationValue);

			await request.post(`${baseUrl}/${appealId}/Inquiry/setup/timetable-due-dates`).send({
				'lpa-questionnaire-due-date-day': '01',
				'lpa-questionnaire-due-date-month': '02',
				'lpa-questionnaire-due-date-year': '3025',
				'statement-due-date-day': '01',
				'statement-due-date-month': '02',
				'statement-due-date-year': '3025',
				'ip-comments-due-date-day': '01',
				'ip-comments-due-date-month': '02',
				'ip-comments-due-date-year': '3025',
				'statement-of-common-ground-due-date-day': '01',
				'statement-of-common-ground-due-date-month': '02',
				'statement-of-common-ground-due-date-year': '3025',
				'proof-of-evidence-and-witnesses-due-date-day': '01',
				'proof-of-evidence-and-witnesses-due-date-month': '02',
				'proof-of-evidence-and-witnesses-due-date-year': '3025',
				'planning-obligation-due-date-day': '01',
				'planning-obligation-due-date-month': '02',
				'planning-obligation-due-date-year': '3025'
			});

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with no address', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/inquiry`, (body) => {
					// Assert required fields exist
					expect(body).toHaveProperty('startDate');
					expect(body).toHaveProperty('inquiryStartTime');
					expect(body).toHaveProperty('lpaQuestionnaireDueDate');
					expect(body).toHaveProperty('statementDueDate');
					expect(body).toHaveProperty('ipCommentsDueDate');
					expect(body).toHaveProperty('statementOfCommonGroundDueDate');
					expect(body).toHaveProperty('proofOfEvidenceAndWitnessesDueDate');
					expect(body).toHaveProperty('caseManagementConferenceDueDate');
					expect(body).toHaveProperty('planningObligationDueDate');
					return true; // IMPORTANT: return true to match
				})
				.reply(201, { inquiryId: 1 });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/start-case/select-procedure`).send({
				appealProcedure: 'inquiry'
			});
			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/inquiry/setup/address`)
				.send({ addressKnown: 'no' });
			await request
				.post(`${baseUrl}/${appealId}/inquiry/setup/address-details`)
				.send(addressValues);
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/estimation`).send(estimationValue);

			await request.post(`${baseUrl}/${appealId}/Inquiry/setup/timetable-due-dates`).send({
				'lpa-questionnaire-due-date-day': '01',
				'lpa-questionnaire-due-date-month': '02',
				'lpa-questionnaire-due-date-year': '3025',
				'statement-due-date-day': '01',
				'statement-due-date-month': '02',
				'statement-due-date-year': '3025',
				'ip-comments-due-date-day': '01',
				'ip-comments-due-date-month': '02',
				'ip-comments-due-date-year': '3025',
				'statement-of-common-ground-due-date-day': '01',
				'statement-of-common-ground-due-date-month': '02',
				'statement-of-common-ground-due-date-year': '3025',
				'proof-of-evidence-and-witnesses-due-date-day': '01',
				'proof-of-evidence-and-witnesses-due-date-month': '02',
				'proof-of-evidence-and-witnesses-due-date-year': '3025',
				'planning-obligation-due-date-day': '01',
				'planning-obligation-due-date-month': '02',
				'planning-obligation-due-date-year': '3025'
			});

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should show 404 page if error is the session data is not present', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/check-details`);

			expect(response.status).toBe(404);
			expect(response.text).toContain('You cannot check these answers');
		});

		it('should show 500 page if error is thrown', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/inquiry`)
				.reply(500, { error: 'Internal Server Error' });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/inquiry/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/inquiry/setup/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/inquiry/setup/address-details`)
				.send(addressValues);

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/setup/check-details`);

			expect(response.status).toBe(500);
			expect(response.text).toContain('Sorry, there is a problem with the service');
		});
	});
});
