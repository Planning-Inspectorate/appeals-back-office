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
		it('should redirect to /hearing/setup/date', async () => {
			nock('http://test/')
				.get(`/appeals/2`)
				.reply(200, { ...appealData, appealId: 2 });

			const response = await request.get(
				`${baseUrl}/2/hearing/setup?backUrl=%2Fappeals-service%2Fappeal-details%2F2`
			);
			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/2/hearing/setup/date?backUrl=%2Fappeals-service%2Fappeal-details%2F2`
			);
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

		it('should have a back link to the original page if specified', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/setup/date?backUrl=/my-cases`
			);
			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe('/my-cases');
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/setup/date?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fsetup%2Fdate`
			);
			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/setup/check-details`
			);
		});

		it('should render any saved response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
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

		it('should render an edited response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealData, appealId });

			const editUrl = `${baseUrl}/${appealId}/hearing/setup/date?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fsetup%2Fdate`;

			//set session data with post request
			await request.post(editUrl).send({
				'hearing-date-day': '08',
				'hearing-date-month': '09',
				'hearing-date-year': '3025',
				'hearing-time-hour': '13',
				'hearing-time-minute': '00'
			});

			const response = await request.get(editUrl);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#hearing-date-day').getAttribute('value')).toEqual('08');
			expect(pageHtml.querySelector('input#hearing-date-month').getAttribute('value')).toEqual(
				'09'
			);
			expect(pageHtml.querySelector('input#hearing-date-year').getAttribute('value')).toEqual(
				'3025'
			);
			expect(pageHtml.querySelector('input#hearing-time-hour').getAttribute('value')).toEqual('13');
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
			expect(errorSummaryHtml).toContain('Enter the hearing date');
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
			expect(errorSummaryHtml).toContain('The hearing date must be in the future');
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
			expect(errorSummaryHtml).toContain('Enter a real hearing time');
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
			expect(errorSummaryHtml).toContain('Enter the hearing time');
		});
	});

	describe('GET /hearing/setup/address', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealData, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/hearing/setup/address`).send({
				addressKnown: 'yes'
			});

			const response = await request.get(`${baseUrl}/${appealId}/hearing/setup/address`);
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

		it('should check the submitted value', () => {
			expect(
				pageHtml.querySelector('input[name="addressKnown"][value="yes"]')?.getAttribute('checked')
			).toBeDefined();
		});

		it('should have a back link to the date page', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/setup/date`
			);
		});

		it('should have a back link to the CYA page if editing this page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealData, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/setup/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fsetup%2Faddress`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/setup/check-details`
			);
		});

		it('should have a back link to the date page if editing began on a previous page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.twice()
				.reply(200, { ...appealData, appealId });

			// set session data with post request
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/setup/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fsetup%2Fdate`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/setup/date?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fsetup%2Fdate`
			);
		});

		it('should check the edited value if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.times(4)
				.reply(200, { ...appealData, appealId });

			const editUrl = `${baseUrl}/${appealId}/hearing/setup/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fsetup%2Faddress`;

			// set session data with post requests
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send({
				'hearing-date-day': '01',
				'hearing-date-month': '02',
				'hearing-date-year': '3025',
				'hearing-time-hour': '12',
				'hearing-time-minute': '00'
			});
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address`)
				.send({ addressKnown: 'no' });
			await request.post(editUrl).send({ addressKnown: 'yes' });

			const response = await request.get(editUrl);
			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(
				html.querySelector('input[name="addressKnown"][value="yes"]')?.getAttribute('checked')
			).toBeDefined();
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
			const response = await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address?editEntrypoint=remove-me`)
				.send({
					addressKnown: 'no'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/hearing/setup/check-details`);
		});

		it('should redirect to /hearing/setup/address-details when answering yes', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address?editEntrypoint=keep-me`)
				.send({
					addressKnown: 'yes'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/hearing/setup/address-details?editEntrypoint=keep-me`
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

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/setup/address-details`);
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

		it('should have a back link to the address page', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/setup/address`
			);
		});

		it('should have a back link to the CYA page if editing this page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.times(4)
				.reply(200, { ...appealData, appealId });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address-details`)
				.send(addressValues);

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/setup/address-details?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fsetup%2Faddress-details`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/setup/check-details`
			);
		});

		it('should have a back link to the address page if editing began on a previous page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.times(4)
				.reply(200, { ...appealData, appealId });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address-details`)
				.send(addressValues);

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/setup/address-details?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fsetup%2Faddress`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/setup/address?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fsetup%2Faddress`
			);
		});

		it('should render the edited values if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.times(5)
				.reply(200, { ...appealData, appealId });

			const editUrl = `${baseUrl}/${appealId}/hearing/setup/address-details?editEntrypoint=%2Fappeals-service%2Fappeal-details%2F2%2Fhearing%2Fsetup%2Faddress-details`;

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address`)
				.send({ addressKnown: 'yes' });
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address-details`)
				.send(addressValues);
			await request.post(editUrl).send({
				addressLine1: 'Apartment 1B',
				addressLine2: '20 Jellybean Lane',
				town: 'Jellytown',
				county: 'Outer Space',
				postCode: 'J25 3YZ'
			});

			const response = await request.get(editUrl);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('input[name="addressLine1"]').getAttribute('value')).toBe(
				'Apartment 1B'
			);
			expect(html.querySelector('input[name="addressLine2"]').getAttribute('value')).toBe(
				'20 Jellybean Lane'
			);
			expect(html.querySelector('input[name="town"]').getAttribute('value')).toBe('Jellytown');
			expect(html.querySelector('input[name="county"]').getAttribute('value')).toBe('Outer Space');
			expect(html.querySelector('input[name="postCode"]').getAttribute('value')).toBe('J25 3YZ');
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

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/setup/check-details?backUrl=%2Fappeals-service%2Fappeal-details%2F2`
			);
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

		it('should have a back link to the address details page', () => {
			expect(pageHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/setup/address-details?backUrl=%2Fappeals-service%2Fappeal-details%2F2`
			);
		});

		it('should have a back link to the address known page if no address was provided', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.times(3)
				.reply(200, { ...appealData, appealId });

			// set session data with post requests to previous pages
			await request.post(`${baseUrl}/${appealId}/hearing/setup/date`).send(dateValues);
			await request
				.post(`${baseUrl}/${appealId}/hearing/setup/address`)
				.send({ addressKnown: 'no' });

			const response = await request.get(
				`${baseUrl}/${appealId}/hearing/setup/check-details?backUrl=%2Fappeals-service%2Fappeal-details%2F2`
			);

			const html = parseHtml(response.text, { rootElement: 'body' });

			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/hearing/setup/address?backUrl=%2Fappeals-service%2Fappeal-details%2F2`
			);
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
