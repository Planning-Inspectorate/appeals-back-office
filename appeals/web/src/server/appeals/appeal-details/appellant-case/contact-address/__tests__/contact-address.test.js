import { appealDataEnforcementNotice } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);

const appealId = appealDataEnforcementNotice.appealId;
const appellantCaseId = appealDataEnforcementNotice.appellantCaseId;
const enforcementNotice = appealDataEnforcementNotice.enforcementNotice;
const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;
const contactAddressId = enforcementNotice?.appellantCase.contactAddress?.addressId;

describe('contact-address', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /add', () => {
		it('should render the add contact address page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, {
					...appealDataEnforcementNotice
				});
			const response = await request.get(`${appellantCaseUrl}/contact-address/add`);

			expect(response.statusCode).toEqual(200);

			const innerHTML = parseHtml(response.text).innerHTML;
			expect(innerHTML).toMatchSnapshot();
			expect(innerHTML).toContain('What is your contact address?</h1>');

			const backInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;
			expect(backInnerHtml).toContain(`href="${appellantCaseUrl}"`);
		});
	});

	describe('POST /add', () => {
		it('should create the address and redirect to Appellant Case page', async () => {
			const apiCall = nock('http://test/')
				.post(`/appeals/${appealId}/appellant-cases/${appellantCaseId}/contact-address`)
				.reply(200, {});

			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, {
					...appealDataEnforcementNotice
				});
			const response = await request.post(`${appellantCaseUrl}/contact-address/add`).send({
				addressLine1: 'line 1',
				town: 'town',
				county: 'country',
				postCode: 'NG7 8LU'
			});

			expect(response.statusCode).toBe(302);
			expect(apiCall.isDone()).toBe(true);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});

		it('should re-render the page with an error if one of the mandatory fields is empty', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, {
					...appealDataEnforcementNotice
				});
			const response = await request.post(`${appellantCaseUrl}/contact-address/add`).send({});

			expect(response.statusCode).toEqual(400);

			const innerHTML = parseHtml(response.text).innerHTML;
			expect(innerHTML).toMatchSnapshot();
			expect(innerHTML).toContain('There is a problem');
			expect(innerHTML).toContain('Enter address line 1</a>');
		});

		it('should re-render the page with an error if one of the fields has too many characters', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, {
					...appealDataEnforcementNotice
				});
			const response = await request.post(`${appellantCaseUrl}/contact-address/add`).send({
				addressLine1: 'a'.repeat(1001),
				town: 'town',
				county: 'country',
				postCode: 'NG7 8LU'
			});

			expect(response.statusCode).toEqual(400);

			const innerHTML = parseHtml(response.text).innerHTML;
			expect(innerHTML).toMatchSnapshot();
			expect(innerHTML).toContain('There is a problem');
			expect(innerHTML).toContain('Address line 1 must be 250 characters or less</a>');
		});
	});

	describe('GET /change/:addressId', () => {
		it('should render the add contact address page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, {
					...appealDataEnforcementNotice
				});
			const response = await request.get(
				`${appellantCaseUrl}/contact-address/change/${enforcementNotice?.appellantCase.contactAddress?.addressId}`
			);

			expect(response.statusCode).toEqual(200);

			const innerHTML = parseHtml(response.text).innerHTML;
			expect(innerHTML).toMatchSnapshot();
			expect(innerHTML).toContain('What is your contact address?</h1>');
			expect(innerHTML).toContain('Address line 1</label>');

			const backInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;
			expect(backInnerHtml).toContain(`href="${appellantCaseUrl}"`);
		});
	});

	describe('POST /change/:addressId', () => {
		it('should update the address and redirect to Appellant Case page', async () => {
			const apiCall = nock('http://test/')
				.patch(
					`/appeals/${appealId}/appellant-cases/${appellantCaseId}/contact-address/${contactAddressId}`
				)
				.reply(200, {});

			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, {
					...appealDataEnforcementNotice
				});
			const response = await request
				.post(`${appellantCaseUrl}/contact-address/change/${contactAddressId}`)
				.send({
					addressLine1: 'line 1',
					town: 'town',
					county: 'country',
					postCode: 'NG7 8LU'
				});

			expect(response.statusCode).toBe(302);
			expect(apiCall.isDone()).toBe(true);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});

		it('should re-render the page with an error if one of the mandatory fields is empty', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, {
					...appealDataEnforcementNotice
				});
			const response = await request
				.post(
					`${appellantCaseUrl}/contact-address/change/${enforcementNotice?.appellantCase.contactAddress?.addressId}`
				)
				.send({});

			expect(response.statusCode).toEqual(400);

			const innerHTML = parseHtml(response.text).innerHTML;
			expect(innerHTML).toMatchSnapshot();
			expect(innerHTML).toContain('There is a problem');
			expect(innerHTML).toContain('Enter address line 1</a>');
		});

		it('should re-render the page with an error if one of the fields has too many characters', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, {
					...appealDataEnforcementNotice
				});
			const response = await request
				.post(
					`${appellantCaseUrl}/contact-address/change/${enforcementNotice?.appellantCase.contactAddress?.addressId}`
				)
				.send({
					addressLine1: 'a'.repeat(1001),
					town: 'town',
					county: 'country',
					postCode: 'NG7 8LU'
				});

			expect(response.statusCode).toEqual(400);

			const innerHTML = parseHtml(response.text).innerHTML;
			expect(innerHTML).toMatchSnapshot();
			expect(innerHTML).toContain('There is a problem');
			expect(innerHTML).toContain('Address line 1 must be 250 characters or less</a>');
		});
	});
});
