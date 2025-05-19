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

describe('set up hearing', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /hearing/setup', () => {
		// eslint-disable-next-line jest/expect-expect
		it('should redirect to /hearing/setup/date', () => {
			return new Promise((resolve) => {
				request
					.get(`${baseUrl}/2/hearing/setup`)
					.expect(302)
					.expect('Location', `${baseUrl}/2/hearing/setup/date`)
					.end(resolve);
			});
		});
	});

	describe('GET /hearing/setup/date', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/setup/date`);
			pageHtml = parseHtml(response.text);
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

		it('should render any saved response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			const response = await request.get(`${baseUrl}/${appealId}/hearing/setup/date`);

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

	describe('POST /hearing/setup/date', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /hearing/setup/address with valid inputs', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/hearing/setup/address`);
		});

		it('should return 400 on invalid date with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send({
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
			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send({
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			expect(response.statusCode).toBe(400);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Hearing date must include a day');
			expect(errorSummaryHtml).toContain('Hearing date must include a month');
			expect(errorSummaryHtml).toContain('Hearing date must include a year');
		});

		it('should return 400 on date in the past with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send({
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
			expect(errorSummaryHtml).toContain('The Hearing date must be in the future');
		});

		it('should return 400 on invalid time with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send({
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
			expect(errorSummaryHtml).toContain(
				'Hearing time hour cannot be less than 0 or greater than 23'
			);
		});

		it('should return 400 on missing time with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send({
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
			expect(errorSummaryHtml).toContain('Hearing time must include an hour');
		});
	});

	describe('GET /hearing/setup/address', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/setup/address`);
			pageHtml = parseHtml(response.text);
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
	});

	describe('POST /hearing/setup/address', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /hearing/setup/confirmation when answering no', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/address`).send({
				addressKnown: 'no'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/hearing/setup/check-details`);
		});

		it('should redirect to /hearing/setup/address-details when answering yes', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/address`).send({
				addressKnown: 'yes'
			});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/hearing/setup/address-details`
			);
		});

		it('should return 400 on missing addressKnown with appropriate error message', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/address`).send({});

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

	describe('GET /hearing/setup/address-details', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/setup/address-details`);
			pageHtml = parseHtml(response.text);
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
	});

	describe('POST /hearing/setup/address-details', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /hearing/setup/check-details with valid inputs', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address-details`)
				.send({
					addressLine1: 'Flat 9',
					addressLine2: '123 Gerbil Drive',
					town: 'Blarberton',
					county: 'Slabshire',
					postCode: 'X25 3YZ'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/hearing/setup/check-details`);
		});

		behavesLikeAddressForm({
			request,
			url: `${baseUrl}/${appealId}/hearing/setup/address-details`
		});
	});

	describe('GET /hearing/setup/check-details', () => {
		const appealId = 1;
		const dateValues = {
			'hearing-date-day': '01',
			'hearing-date-month': '02',
			'hearing-date-year': '3025',
			'hearing-time-hour': '12',
			'hearing-time-minute': '00'
		};
		const addressValues = {
			addressLine1: 'Flat 9',
			addressLine2: '123 Gerbil Drive',
			town: 'Blarberton',
			county: 'Slabshire',
			postCode: 'X25 3YZ'
		};

		let pageHtml;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address-details`)
				.send(addressValues);

			const response = await request.get(`${baseUrl}/${appealId}/hearing/setup/check-details`);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Check details and set up hearing'
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
			expect(pageHtml.querySelectorAll('dd.govuk-summary-list__value')?.[2]?.innerHTML.trim()).toBe(
				'Yes'
			);
		});

		it('should render the correct address', () => {
			expect(
				pageHtml
					.querySelectorAll('dd.govuk-summary-list__value')?.[3]
					?.innerHTML.split('<br>')
					.map((line) => line.trim())
			).toEqual(['Flat 9', '123 Gerbil Drive', 'Blarberton', 'Slabshire', 'X25 3YZ']);
		});

		it('should render the correct button text', () => {
			expect(pageHtml.querySelector('button')?.innerHTML.trim()).toBe('Set up hearing');
		});
	});

	describe('POST /hearing/setup/check-details', () => {
		const appealId = 1;

		const dateValues = {
			'hearing-date-day': '01',
			'hearing-date-month': '02',
			'hearing-date-year': '3025',
			'hearing-time-hour': '12',
			'hearing-time-minute': '00'
		};
		const addressValues = {
			addressLine1: 'Flat 9',
			addressLine2: '123 Gerbil Drive',
			town: 'Blarberton',
			county: 'Slabshire',
			postCode: 'X25 3YZ'
		};

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to appeal details page after submission with address', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/hearing`, {
					hearingStartTime: '3025-02-01T12:00:00.000Z',
					address: { ...omit(addressValues, 'postCode'), postcode: addressValues.postCode }
				})
				.reply(201, { hearingId: 1 });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address-details`)
				.send(addressValues);

			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should redirect to appeal details page after submission with no address', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/hearing`, {
					hearingStartTime: '3025-02-01T12:00:00.000Z'
				})
				.reply(201, { hearingId: 1 });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address`)
				.send({ addressKnown: 'no' });

			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/check-details`);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}`);
		});

		it('should show 404 page if error is the session data is not present', async () => {
			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/check-details`);

			expect(response.status).toBe(404);
			expect(response.text).toContain('You cannot check these answers');
		});

		it('should show 500 page if error is thrown', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/hearing`)
				.reply(500, { error: 'Internal Server Error' });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address-details`)
				.send(addressValues);

			const response = await request.post(`${baseUrl}/${appealId}/hearing/setup/check-details`);

			expect(response.status).toBe(500);
			expect(response.text).toContain('Sorry, there is a problem with the service');
		});
	});
});
