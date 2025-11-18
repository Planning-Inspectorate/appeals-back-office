// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { behavesLikeAddressForm } from '#testing/app/shared-examples/address-form.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import { omit } from 'lodash-es';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealId = 2;

const appealWithInquiry = {
	...appealData,
	inquiry: {
		inquiryId: 1,
		inquiryStartTime: '3024-03-02T08:54:00.000Z',
		estimatedDays: 6,
		address: {
			addressLine1: 'Flat 9',
			addressLine2: '123 Gerbil Drive',
			town: 'Blarberton',
			county: 'Slabshire',
			postcode: 'X25 3YZ'
		}
	}
};

const appealWithInquiryNoAddress = {
	...appealData,
	inquiry: {
		inquiryStartTime: '2025-01-01T00:00:00.000Z'
	}
};

describe('change inquiry', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /inquiry/change', () => {
		// eslint-disable-next-line jest/expect-expect
		it('should redirect to /inquiry/change/date', () => {
			return new Promise((resolve) => {
				request
					.get(`${baseUrl}/2/inquiry/change`)
					.expect(302)
					.expect('Location', `${baseUrl}/2/inquiry/change/date`)
					.end(resolve);
			});
		});
	});

	describe('GET /inquiry/change/date', () => {
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/date`);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
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

		it('should have a back link to the original page if specified', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/change/date?backUrl=/my-cases`
			);
			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe('/my-cases');
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/change/date?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fchange%2Fdate`
			);
			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/change/check-details`
			);
		});

		it('should render the existing date and time', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/date`);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#inquiry-date-day').getAttribute('value')).toEqual('2');
			expect(pageHtml.querySelector('input#inquiry-date-month').getAttribute('value')).toEqual('3');
			expect(pageHtml.querySelector('input#inquiry-date-year').getAttribute('value')).toEqual(
				'3024'
			);
			expect(pageHtml.querySelector('input#inquiry-time-hour').getAttribute('value')).toEqual('8');
			expect(pageHtml.querySelector('input#inquiry-time-minute').getAttribute('value')).toEqual(
				'54'
			);
		});

		it('should render any submitted response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.twice()
				.reply(200, { ...appealWithInquiry, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send({
				'inquiry-date-day': '01',
				'inquiry-date-month': '02',
				'inquiry-date-year': '3025',
				'inquiry-time-hour': '12',
				'inquiry-time-minute': '00'
			});

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/date`);

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

	describe('POST /inquiry/change/date', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });
		});
		afterEach(teardown);

		it('should redirect to /inquiry/change/estimation with valid inputs', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send({
				'inquiry-date-day': '01',
				'inquiry-date-month': '02',
				'inquiry-date-year': '3025',
				'inquiry-time-hour': '12',
				'inquiry-time-minute': '00'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/inquiry/change/estimation`);
		});

		it('should return 400 on invalid date with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send({
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
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send({
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
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send({
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
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send({
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
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send({
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

	describe('GET /inquiry/change/address', () => {
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/address`);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
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

		it('should have a back link to the date page', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/change/estimation`
			);
		});

		it('should preselect yes if the existing inquiry has an address', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/address`);

			const html = parseHtml(response.text);

			expect(
				html.querySelector('input[name="addressKnown"][value="yes"]')?.getAttribute('checked')
			).toBeDefined();
		});

		it('should preselect no if the existing inquiry has no address', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiryNoAddress, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/address`);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(
				html.querySelector('input[name="addressKnown"][value="no"]')?.getAttribute('checked')
			).toBeDefined();
		});

		it('should render the submitted value', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.twice()
				.reply(200, { ...appealWithInquiry, appealId });

			//set session data with post request
			await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address`)
				.send({ addressKnown: 'no' });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/address`);

			const html = parseHtml(response.text);

			expect(
				html.querySelector('input[name="addressKnown"][value="no"]')?.getAttribute('checked')
			).toBeDefined();
		});

		it('should have a back link to the previous page', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/address`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/change/estimation`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fchange%2Faddress`;
			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/change/address${queryString}`
			);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/change/check-details`
			);
		});

		it('should have a back link to the previous page if editing began on another page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/change/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fchange%2Festimation`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/change/estimation?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fchange%2Festimation`
			);
		});
	});

	describe('POST /inquiry/change/address', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });
		});
		afterEach(teardown);

		it('should redirect to /inquiry/change/confirmation when answering no', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address?editEntrypoint=remove-me`)
				.send({
					addressKnown: 'no'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/inquiry/change/check-details`);
		});

		it('should redirect to /inquiry/change/address-details when answering yes', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/address`).send({
				addressKnown: 'yes'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/inquiry/change/address-details`
			);
		});

		it('should return 400 on missing addressKnown with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/address`).send({});

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

	describe('GET /inquiry/change/address-details', () => {
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/address-details`);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});
		afterEach(teardown);

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

		it('should have a back link to the address known page', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/change/address`
			);
		});

		it('should have a back link to the previous page', async () => {
			nock('http://test/')
				.persist()
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/address-details`);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/change/address`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const queryString = `?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fchange%2Faddress-details`;
			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/change/address-details${queryString}`
			);
			const bodyHtml = parseHtml(response.text, { rootElement: 'body' });

			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/change/check-details`
			);
		});

		it('should have a back link to the previous page if editing began on another page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/change/address-details?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fchange%2Faddress`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/inquiry/change/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Finquiry%2Fchange%2Faddress`
			);
		});

		it('should render the existing address', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/address-details`);

			const html = parseHtml(response.text);

			expect(html.querySelector('input[name="addressLine1"]').getAttribute('value')).toEqual(
				'Flat 9'
			);
			expect(html.querySelector('input[name="addressLine2"]').getAttribute('value')).toEqual(
				'123 Gerbil Drive'
			);
			expect(html.querySelector('input[name="town"]').getAttribute('value')).toEqual('Blarberton');
			expect(html.querySelector('input[name="county"]').getAttribute('value')).toEqual('Slabshire');
			expect(html.querySelector('input[name="postCode"]').getAttribute('value')).toEqual('X25 3YZ');
		});

		it('should render any submitted response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.twice()
				.reply(200, { ...appealWithInquiry, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/inquiry/change/address-details`).send({
				addressLine1: 'Flat 8',
				addressLine2: '29 Hamster Road',
				town: 'Bristleton',
				county: 'Tuscany',
				postCode: 'T12 3YZ'
			});

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/address-details`);

			const html = parseHtml(response.text);

			expect(html.querySelector('input[name="addressLine1"]').getAttribute('value')).toEqual(
				'Flat 8'
			);
			expect(html.querySelector('input[name="addressLine2"]').getAttribute('value')).toEqual(
				'29 Hamster Road'
			);
			expect(html.querySelector('input[name="town"]').getAttribute('value')).toEqual('Bristleton');
			expect(html.querySelector('input[name="county"]').getAttribute('value')).toEqual('Tuscany');
			expect(html.querySelector('input[name="postCode"]').getAttribute('value')).toEqual('T12 3YZ');
		});
	});

	describe('POST /inquiry/change/address-details', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithInquiry, appealId });
		});
		afterEach(teardown);

		it('should redirect to /inquiry/change/check-details with valid inputs', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address-details`)
				.send({
					addressLine1: 'Flat 9',
					addressLine2: '123 Gerbil Drive',
					town: 'Blarberton',
					county: 'Slabshire',
					postCode: 'X25 3YZ'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/inquiry/change/check-details`);
		});

		behavesLikeAddressForm({
			request,
			url: `${baseUrl}/${appealId}/inquiry/change/address-details`
		});
	});

	describe('GET /inquiry/change/check-details', () => {
		const dateValues = {
			'inquiry-date-day': '01',
			'inquiry-date-month': '02',
			'inquiry-date-year': '3025',
			'inquiry-time-hour': '12',
			'inquiry-time-minute': '00'
		};
		const addressValues = {
			addressLine1: 'Flat 8',
			addressLine2: '29 Hamster Road',
			town: 'Bristleton',
			county: 'Tuscany',
			postCode: 'T12 3YZ'
		};

		describe('when all pages have been submitted', () => {
			let pageHtml;

			beforeEach(async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.times(5)
					.reply(200, { ...appealWithInquiry, appealId });

				// set session data with post requests to previous pages
				await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send(dateValues);
				await request.post(`${baseUrl}/${appealId}/inquiry/change/estimation`).send({
					inquiryEstimationYesNo: 'yes',
					inquiryEstimationDays: '10'
				});
				await request
					.post(`${baseUrl}/${appealId}/inquiry/change/address`)
					.send({ addressKnown: 'yes' });
				await request
					.post(`${baseUrl}/${appealId}/inquiry/change/address-details`)
					.send(addressValues);

				const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/check-details`);
				pageHtml = parseHtml(response.text, { rootElement: 'body' });
			});
			afterEach(teardown);

			it('should match the snapshot', () => {
				expect(pageHtml.innerHTML).toMatchSnapshot();
			});

			it('should render the correct heading', () => {
				expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
					'Check details and update inquiry'
				);
			});

			it('should render the submitted date', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[0]?.innerHTML.trim()
				).toBe('1 February 3025');
			});

			it('should render the submitted time', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[1]?.innerHTML.trim()
				).toBe('12:00pm');
			});

			it('should render the submitted yes or no answer for estimated days', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[2]?.innerHTML.trim()
				).toBe('Yes');
			});

			it('should render the correct number of estimated days', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[3]?.innerHTML.trim()
				).toBe('10 days');
			});

			it('should render the submitted yes or no answer', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[4]?.innerHTML.trim()
				).toBe('Yes');
			});

			it('should render the submitted address', () => {
				expect(
					pageHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[5]
						?.innerHTML.split('<br>')
						.map((line) => line.trim())
				).toEqual(['Flat 8', '29 Hamster Road', 'Bristleton', 'Tuscany', 'T12 3YZ']);
			});

			it('should render the correct button text', () => {
				expect(pageHtml.querySelector('button')?.innerHTML.trim()).toBe('Update inquiry');
			});

			it('should have a back link to the address details page', () => {
				expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
					`${baseUrl}/${appealId}/inquiry/change/address-details`
				);
			});

			it('should have a back link to the address known page if no address was provided', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.times(3)
					.reply(200, { ...appealWithInquiry, appealId });

				// set session data with post requests to previous pages
				await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send(dateValues);
				await request
					.post(`${baseUrl}/${appealId}/inquiry/change/address`)
					.send({ addressKnown: 'no' });

				const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/check-details`);

				const html = parseHtml(response.text, { rootElement: 'body' });

				expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
					`${baseUrl}/${appealId}/inquiry/change/address`
				);
			});
		});

		describe('when only address not known has been submitted', () => {
			let pageHtml;

			beforeEach(async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.twice()
					.reply(200, { ...appealWithInquiry, appealId });

				// set session data with post requests to previous pages
				await request
					.post(`${baseUrl}/${appealId}/inquiry/change/address`)
					.send({ addressKnown: 'no' });

				const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/check-details`);
				pageHtml = parseHtml(response.text);
			});
			afterEach(teardown);

			it('should match the snapshot', () => {
				expect(pageHtml.innerHTML).toMatchSnapshot();
			});

			it('should render the existing date', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[0]?.innerHTML.trim()
				).toBe('2 March 3024');
			});

			it('should render the existing time', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[1]?.innerHTML.trim()
				).toBe('8:54am');
			});

			it('should render the correct yes or no answer for estimated Days', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[2]?.innerHTML.trim()
				).toBe('Yes');
			});

			it('should not render the estimated days', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[3].innerHTML.trim()
				).toBe('6 days');
			});

			it('should render the correct yes or no answer', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[4]?.innerHTML.trim()
				).toBe('No');
			});

			it('should not render the address', () => {
				expect(pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[5]).toBeUndefined();
			});
		});

		describe('when only yes and address details have been submitted', () => {
			let pageHtml;

			beforeEach(async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.times(3)
					.reply(200, { ...appealWithInquiry, appealId });

				// set session data with post requests to previous pages
				await request
					.post(`${baseUrl}/${appealId}/inquiry/change/address`)
					.send({ addressKnown: 'yes' });
				await request
					.post(`${baseUrl}/${appealId}/inquiry/change/address-details`)
					.send(addressValues);

				const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/check-details`);
				pageHtml = parseHtml(response.text);
			});
			afterEach(teardown);

			it('should match the snapshot', () => {
				expect(pageHtml.innerHTML).toMatchSnapshot();
			});

			it('should render the existing date', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[0]?.innerHTML.trim()
				).toBe('2 March 3024');
			});

			it('should render the existing time', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[1]?.innerHTML.trim()
				).toBe('8:54am');
			});

			it('should render correct submitted estimatedDays yes or no answer', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[2]?.innerHTML.trim()
				).toEqual('Yes');
			});

			it('should render the submitted estimatedDays', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[3]?.innerHTML.trim()
				).toEqual('6 days');
			});

			it('should render the correct yes or no answer', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[4]?.innerHTML.trim()
				).toBe('Yes');
			});

			it('should render the submitted address', () => {
				expect(
					pageHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[5]
						?.innerHTML.split('<br>')
						.map((line) => line.trim())
				).toEqual(['Flat 8', '29 Hamster Road', 'Bristleton', 'Tuscany', 'T12 3YZ']);
			});
		});

		describe('when only address details have been submitted', () => {
			let pageHtml;

			beforeEach(async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.times(3)
					.reply(200, {
						...appealWithInquiry,
						appealId,
						inquiry: { ...appealWithInquiry.inquiry, address: null }
					});

				// set session data with post requests to previous pages
				await request
					.post(`${baseUrl}/${appealId}/inquiry/change/address-details`)
					.send(addressValues);

				const response = await request.get(`${baseUrl}/${appealId}/inquiry/change/check-details`);
				pageHtml = parseHtml(response.text);
			});
			afterEach(teardown);

			it('should match the snapshot', () => {
				expect(pageHtml.innerHTML).toMatchSnapshot();
			});

			it('should render the existing date', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[0]?.innerHTML.trim()
				).toBe('2 March 3024');
			});

			it('should render the existing time', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[1]?.innerHTML.trim()
				).toBe('8:54am');
			});

			it('should render correct submitted estimatedDays yes or no answer', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[2]?.innerHTML.trim()
				).toEqual('Yes');
			});

			it('should render the submitted estimatedDays', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[3]?.innerHTML.trim()
				).toEqual('6 days');
			});

			it('should render the yes to address known', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[4]?.innerHTML.trim()
				).toBe('Yes');
			});

			it('should render the submitted address', () => {
				expect(
					pageHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[5]
						?.innerHTML.split('<br>')
						.map((line) => line.trim())
				).toEqual(['Flat 8', '29 Hamster Road', 'Bristleton', 'Tuscany', 'T12 3YZ']);
			});
		});
	});
	describe('POST /inquiry/change/check-details', () => {
		const dateValues = {
			'inquiry-date-day': '01',
			'inquiry-date-month': '02',
			'inquiry-date-year': '3025',
			'inquiry-time-hour': '12',
			'inquiry-time-minute': '00'
		};
		const addressValues = {
			addressLine1: 'Flat 8',
			addressLine2: '29 Hamster Road',
			town: 'Bristleton',
			county: 'Tuscany',
			postCode: 'T12 3YZ'
		};

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.times(4)
				.reply(200, { ...appealWithInquiry, appealId });
		});
		afterEach(teardown);

		it('should redirect to appeal details page after submission with address', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/inquiry/${appealWithInquiry.inquiry.inquiryId}`, {
					inquiryStartTime: '3025-02-01T12:00:00.000Z',
					estimatedDays: 6,
					address: { ...omit(addressValues, 'postCode'), postcode: addressValues.postCode }
				})
				.reply(200, { inquiryId: 1 });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address-details`)
				.send(addressValues);

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with no address', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/inquiry/${appealWithInquiry.inquiry.inquiryId}`, {
					inquiryStartTime: '3025-02-01T12:00:00.000Z',
					estimatedDays: 6,
					address: null
				})
				.reply(200, { inquiryId: 1 });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address`)
				.send({ addressKnown: 'no' });

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with unchanged address', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/inquiry/${appealWithInquiry.inquiry.inquiryId}`, {
					inquiryStartTime: '3025-02-01T12:00:00.000Z', // address not sent if unchanged
					estimatedDays: 6
				})
				.reply(200, { inquiryId: 1 });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address`)
				.send({ addressKnown: 'yes' });
			await request.post(`${baseUrl}/${appealId}/inquiry/change/address-details`).send({
				...appealWithInquiry.inquiry.address,
				postCode: appealWithInquiry.inquiry.address.postcode
			});

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with only address', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/inquiry/${appealWithInquiry.inquiry.inquiryId}`, {
					inquiryStartTime: '3024-03-02T08:54:00.000Z', // original date and time
					address: { ...omit(addressValues, 'postCode'), postcode: addressValues.postCode },
					estimatedDays: 6
				})
				.reply(200, { inquiryId: 1 });

			// set session data with post requests to previous pages
			await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address-details`)
				.send(addressValues);

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with only yes and address', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/inquiry/${appealWithInquiry.inquiry.inquiryId}`, {
					inquiryStartTime: '3024-03-02T08:54:00.000Z', // original date and time
					address: { ...omit(addressValues, 'postCode'), postcode: addressValues.postCode },
					estimatedDays: 6
				})
				.reply(200, { inquiryId: 1 });

			// set session data with post requests to previous pages
			await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address-details`)
				.send(addressValues);

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with only no', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/inquiry/${appealWithInquiry.inquiry.inquiryId}`, {
					inquiryStartTime: '3024-03-02T08:54:00.000Z', // original date and time
					estimatedDays: 6,
					address: null
				})
				.reply(200, { inquiryId: 1 });

			// set session data with post requests to previous pages
			await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address`)
				.send({ addressKnown: 'no' });

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should show 500 page if error is thrown', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/inquiry`)
				.reply(500, { error: 'Internal Server Error' });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/inquiry/change/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/inquiry/change/address-details`)
				.send(addressValues);

			const response = await request.post(`${baseUrl}/${appealId}/inquiry/change/check-details`);

			expect(response.status).toBe(500);
			expect(response.text).toContain('Sorry, there is a problem with the service');
		});
	});
});
