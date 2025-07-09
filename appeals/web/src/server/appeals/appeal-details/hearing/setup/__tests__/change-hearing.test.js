// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { behavesLikeAddressForm } from '#testing/app/shared-examples/address-form.js';
import { omit } from 'lodash-es';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealId = 2;

const appealWithHearing = {
	...appealData,
	hearing: {
		hearingId: 1,
		hearingStartTime: '3024-03-02T08:54:00.000Z',
		address: {
			addressLine1: 'Flat 9',
			addressLine2: '123 Gerbil Drive',
			town: 'Blarberton',
			county: 'Slabshire',
			postcode: 'X25 3YZ'
		}
	}
};

const appealWithHearingNoAddress = {
	...appealData,
	hearing: {
		hearingStartTime: '2025-01-01T00:00:00.000Z'
	}
};

describe('change hearing', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /hearing/change', () => {
		// eslint-disable-next-line jest/expect-expect
		it('should redirect to /hearing/change/date', () => {
			return new Promise((resolve) => {
				request
					.get(`${baseUrl}/2/hearing/change`)
					.expect(302)
					.expect('Location', `${baseUrl}/2/hearing/change/date`)
					.end(resolve);
			});
		});
	});

	describe('GET /hearing/change/date', () => {
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/change/date`);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Date and time');
		});

		it('should render a Date field', () => {
			expect(pageHtml.querySelector('input#hearing-date-day')).not.toBeNull();
			expect(pageHtml.querySelector('input#hearing-date-month')).not.toBeNull();
			expect(pageHtml.querySelector('input#hearing-date-year')).not.toBeNull();
		});

		it('should render a Time field', () => {
			expect(pageHtml.querySelector('input#hearing-time-hour')).not.toBeNull();
			expect(pageHtml.querySelector('input#hearing-time-minute')).not.toBeNull();
		});

		it('should have a back link to the appeal details page', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/change/date?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fchange%2Fdate`
			);
			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/change/check-details`
			);
		});

		it('should render the existing date and time', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/change/date`);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#hearing-date-day').getAttribute('value')).toEqual('2');
			expect(pageHtml.querySelector('input#hearing-date-month').getAttribute('value')).toEqual('3');
			expect(pageHtml.querySelector('input#hearing-date-year').getAttribute('value')).toEqual(
				'3024'
			);
			expect(pageHtml.querySelector('input#hearing-time-hour').getAttribute('value')).toEqual('8');
			expect(pageHtml.querySelector('input#hearing-time-minute').getAttribute('value')).toEqual(
				'54'
			);
		});

		it('should render any submitted response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealWithHearing, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			const response = await request.get(`${baseUrl}/${appealId}/hearing/change/date`);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#hearing-date-day').getAttribute('value')).toEqual('01');
			expect(pageHtml.querySelector('input#hearing-date-month').getAttribute('value')).toEqual(
				'02'
			);
			expect(pageHtml.querySelector('input#hearing-date-year').getAttribute('value')).toEqual(
				'3025'
			);
			expect(pageHtml.querySelector('input#hearing-time-hour').getAttribute('value')).toEqual('12');
			expect(pageHtml.querySelector('input#hearing-time-minute').getAttribute('value')).toEqual(
				'00'
			);
		});
	});

	describe('POST /hearing/change/date', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });
		});

		it('should redirect to /hearing/change/address with valid inputs', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/hearing/change/address`);
		});

		it('should return 400 on invalid date with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send({
				'hearing-date-day': '31',
				'hearing-date-month': '02',
				'hearing-date-year': '2025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Hearing date must be a real date');
		});

		it('should return 400 on missing date with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send({
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter the hearing date');
		});

		it('should return 400 on date in the past with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send({
				'hearing-date-day': '28',
				'hearing-date-month': '02',
				'hearing-date-year': '1999',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('The hearing date must be in the future');
		});

		it('should return 400 on invalid time with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send({
				'hearing-date-day': '28',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '99',
				'hearing-time-minute': '99'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a real hearing time');
		});

		it('should return 400 on missing time with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send({
				'hearing-date-day': '28',
				'hearing-date-month': '02',
				'hearing-date-year': '3025'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter the hearing time');
		});
	});

	describe('GET /hearing/change/address', () => {
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/change/address`);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Do you know the address of where the hearing will take place?'
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
				`${baseUrl}/${appealId}/hearing/change/date`
			);
		});

		it('should have a back link to the CYA page if editing this page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealWithHearing, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/change/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fchange%2Faddress`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/change/check-details`
			);
		});

		it('should have a back link to the date page if editing began on a previous page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealWithHearing, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/change/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fchange%2Fdate`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/change/date?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fchange%2Fdate`
			);
		});

		it('should preselect yes if the existing hearing has an address', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/change/address`);

			const html = parseHtml(response.text);

			expect(
				html.querySelector('input[name="addressKnown"][value="yes"]')?.getAttribute('checked')
			).toBeDefined();
		});

		it('should preselect no if the existing hearing has no address', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearingNoAddress, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/change/address`);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(
				html.querySelector('input[name="addressKnown"][value="no"]')?.getAttribute('checked')
			).toBeDefined();
		});

		it('should render the submitted value', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealWithHearing, appealId });

			//set session data with post request
			await request
				.post(`${baseUrl}/${appealId}/hearing/change/address`)
				.send({ addressKnown: 'no' });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/change/address`);

			const html = parseHtml(response.text);

			expect(
				html.querySelector('input[name="addressKnown"][value="no"]')?.getAttribute('checked')
			).toBeDefined();
		});
	});

	describe('POST /hearing/change/address', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });
		});

		it('should redirect to /hearing/change/confirmation when answering no', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/hearing/change/address?editEntrypoint=remove-me`)
				.send({
					addressKnown: 'no'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/hearing/change/check-details`);
		});

		it('should redirect to /hearing/change/address-details when answering yes', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/hearing/change/address?editEntrypoint=keep-me`)
				.send({
					addressKnown: 'yes'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/hearing/change/address-details?editEntrypoint=keep-me`
			);
		});

		it('should return 400 on missing addressKnown with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/address`).send({});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Select yes if you know the address of where the hearing will take place'
			);
		});
	});

	describe('GET /hearing/change/address-details', () => {
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/change/address-details`);
			pageHtml = parseHtml(response.text, { rootElement: 'body' });
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Address');
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
				`${baseUrl}/${appealId}/hearing/change/address`
			);
		});

		it('should have a back link to the CYA page if editing this page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/change/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fchange%2Faddress`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/change/check-details`
			);
		});

		it('should have a back link to the date page if editing began on a previous page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/change/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fchange%2Fdate`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/change/date?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fchange%2Fdate`
			);
		});

		it('should render the existing address', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/change/address-details`);

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
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealWithHearing, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/hearing/change/address-details`).send({
				addressLine1: 'Flat 8',
				addressLine2: '29 Hamster Road',
				town: 'Bristleton',
				county: 'Tuscany',
				postCode: 'T12 3YZ'
			});

			const response = await request.get(`${baseUrl}/${appealId}/hearing/change/address-details`);

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

	describe('POST /hearing/change/address-details', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealWithHearing, appealId });
		});

		it('should redirect to /hearing/change/check-details with valid inputs', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/hearing/change/address-details`)
				.send({
					addressLine1: 'Flat 9',
					addressLine2: '123 Gerbil Drive',
					town: 'Blarberton',
					county: 'Slabshire',
					postCode: 'X25 3YZ'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/hearing/change/check-details`);
		});

		behavesLikeAddressForm({
			request,
			url: `${baseUrl}/${appealId}/hearing/change/address-details`
		});
	});

	describe('GET /hearing/change/check-details', () => {
		const dateValues = {
			'hearing-date-day': '01',
			'hearing-date-month': '02',
			'hearing-date-year': '3025',
			'hearing-time-hour': '12',
			'hearing-time-minute': '00'
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
					.get(`/appeals/${appealId}`)
					.times(4)
					.reply(200, { ...appealWithHearing, appealId });

				// set session data with post requests to previous pages
				await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send(dateValues);
				await request
					.post(`${baseUrl}/${appealId}/hearing/change/address`)
					.send({ addressKnown: 'yes' });
				await request
					.post(`${baseUrl}/${appealId}/hearing/change/address-details`)
					.send(addressValues);

				const response = await request.get(`${baseUrl}/${appealId}/hearing/change/check-details`);
				pageHtml = parseHtml(response.text, { rootElement: 'body' });
			});

			it('should match the snapshot', () => {
				expect(pageHtml.innerHTML).toMatchSnapshot();
			});

			it('should render the correct heading', () => {
				expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
					'Check details and set up hearing'
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

			it('should render the submitted yes or no answer', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[2]?.innerHTML.trim()
				).toBe('Yes');
			});

			it('should render the submitted address', () => {
				expect(
					pageHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[3]
						?.innerHTML.split('<br>')
						.map((line) => line.trim())
				).toEqual(['Flat 8', '29 Hamster Road', 'Bristleton', 'Tuscany', 'T12 3YZ']);
			});

			it('should render the correct button text', () => {
				expect(pageHtml.querySelector('button')?.innerHTML.trim()).toBe('Update hearing');
			});

			it('should have a back link to the address details page', () => {
				expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
					`${baseUrl}/${appealId}/hearing/change/address-details`
				);
			});

			it('should have a back link to the address known page if no address was provided', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.times(3)
					.reply(200, { ...appealWithHearing, appealId });

				// set session data with post requests to previous pages
				await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send(dateValues);
				await request
					.post(`${baseUrl}/${appealId}/hearing/change/address`)
					.send({ addressKnown: 'no' });

				const response = await request.get(`${baseUrl}/${appealId}/hearing/change/check-details`);

				const html = parseHtml(response.text, { rootElement: 'body' });

				expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
					`${baseUrl}/${appealId}/hearing/change/address`
				);
			});
		});

		describe('when only address not known has been submitted', () => {
			let pageHtml;

			beforeEach(async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.twice()
					.reply(200, { ...appealWithHearing, appealId });

				// set session data with post requests to previous pages
				await request
					.post(`${baseUrl}/${appealId}/hearing/change/address`)
					.send({ addressKnown: 'no' });

				const response = await request.get(`${baseUrl}/${appealId}/hearing/change/check-details`);
				pageHtml = parseHtml(response.text);
			});

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

			it('should render the correct yes or no answer', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[2]?.innerHTML.trim()
				).toBe('No');
			});

			it('should not render the address', () => {
				expect(pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[3]).toBeUndefined();
			});
		});

		describe('when only yes and address details have been submitted', () => {
			let pageHtml;

			beforeEach(async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.times(3)
					.reply(200, { ...appealWithHearing, appealId });

				// set session data with post requests to previous pages
				await request
					.post(`${baseUrl}/${appealId}/hearing/change/address`)
					.send({ addressKnown: 'yes' });
				await request
					.post(`${baseUrl}/${appealId}/hearing/change/address-details`)
					.send(addressValues);

				const response = await request.get(`${baseUrl}/${appealId}/hearing/change/check-details`);
				pageHtml = parseHtml(response.text);
			});

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

			it('should render the correct yes or no answer', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[2]?.innerHTML.trim()
				).toBe('Yes');
			});

			it('should render the submitted address', () => {
				expect(
					pageHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[3]
						?.innerHTML.split('<br>')
						.map((line) => line.trim())
				).toEqual(['Flat 8', '29 Hamster Road', 'Bristleton', 'Tuscany', 'T12 3YZ']);
			});
		});

		describe('when only address details have been submitted', () => {
			let pageHtml;

			beforeEach(async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.twice()
					.reply(200, { ...appealWithHearing, appealId });

				// set session data with post requests to previous pages
				await request
					.post(`${baseUrl}/${appealId}/hearing/change/address-details`)
					.send(addressValues);

				const response = await request.get(`${baseUrl}/${appealId}/hearing/change/check-details`);
				pageHtml = parseHtml(response.text);
			});

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

			it('should render the correct yes or no answer', () => {
				expect(
					pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[2]?.innerHTML.trim()
				).toBe('Yes');
			});

			it('should render the submitted address', () => {
				expect(
					pageHtml
						.querySelectorAll('dd.govuk-summary-list__value')?.[3]
						?.innerHTML.split('<br>')
						.map((line) => line.trim())
				).toEqual(['Flat 8', '29 Hamster Road', 'Bristleton', 'Tuscany', 'T12 3YZ']);
			});
		});
	});
	describe('POST /hearing/change/check-details', () => {
		const dateValues = {
			'hearing-date-day': '01',
			'hearing-date-month': '02',
			'hearing-date-year': '3025',
			'hearing-time-hour': '12',
			'hearing-time-minute': '00'
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
				.get(`/appeals/${appealId}`)
				.times(4)
				.reply(200, { ...appealWithHearing, appealId });
		});

		it('should redirect to appeal details page after submission with address', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/hearing/${appealWithHearing.hearing.hearingId}`, {
					hearingStartTime: '3025-02-01T12:00:00.000Z',
					address: { ...omit(addressValues, 'postCode'), postcode: addressValues.postCode }
				})
				.reply(200, { hearingId: 1 });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/change/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/hearing/change/address-details`)
				.send(addressValues);

			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with no address', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/hearing/${appealWithHearing.hearing.hearingId}`, {
					hearingStartTime: '3025-02-01T12:00:00.000Z',
					address: null
				})
				.reply(200, { hearingId: 1 });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/change/address`)
				.send({ addressKnown: 'no' });

			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with unchanged address', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/hearing/${appealWithHearing.hearing.hearingId}`, {
					hearingStartTime: '3025-02-01T12:00:00.000Z' // address not sent if unchanged
				})
				.reply(200, { hearingId: 1 });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/change/address`)
				.send({ addressKnown: 'yes' });
			await request.post(`${baseUrl}/${appealId}/hearing/change/address-details`).send({
				...appealWithHearing.hearing.address,
				postCode: appealWithHearing.hearing.address.postcode
			});

			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with only address', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/hearing/${appealWithHearing.hearing.hearingId}`, {
					hearingStartTime: '3024-03-02T08:54:00.000Z', // original date and time
					address: { ...omit(addressValues, 'postCode'), postcode: addressValues.postCode }
				})
				.reply(200, { hearingId: 1 });

			// set session data with post requests to previous pages
			await request
				.post(`${baseUrl}/${appealId}/hearing/change/address-details`)
				.send(addressValues);

			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with only yes and address', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/hearing/${appealWithHearing.hearing.hearingId}`, {
					hearingStartTime: '3024-03-02T08:54:00.000Z', // original date and time
					address: { ...omit(addressValues, 'postCode'), postcode: addressValues.postCode }
				})
				.reply(200, { hearingId: 1 });

			// set session data with post requests to previous pages
			await request
				.post(`${baseUrl}/${appealId}/hearing/change/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/hearing/change/address-details`)
				.send(addressValues);

			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with only no', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/hearing/${appealWithHearing.hearing.hearingId}`, {
					hearingStartTime: '3024-03-02T08:54:00.000Z', // original date and time
					address: null
				})
				.reply(200, { hearingId: 1 });

			// set session data with post requests to previous pages
			await request
				.post(`${baseUrl}/${appealId}/hearing/change/address`)
				.send({ addressKnown: 'no' });

			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should show 404 page if error is the session data is not present', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/check-details`);

			expect(response.status).toBe(404);
			expect(response.text).toContain('You cannot check these answers');
		});

		it('should show 500 page if error is thrown', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/hearing`)
				.reply(500, { error: 'Internal Server Error' });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/change/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/change/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/hearing/change/address-details`)
				.send(addressValues);

			const response = await request.post(`${baseUrl}/${appealId}/hearing/change/check-details`);

			expect(response.status).toBe(500);
			expect(response.text).toContain('Sorry, there is a problem with the service');
		});
	});
});
