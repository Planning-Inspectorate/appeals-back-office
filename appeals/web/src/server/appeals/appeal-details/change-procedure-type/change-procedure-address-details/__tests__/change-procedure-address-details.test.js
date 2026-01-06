// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { behavesLikeAddressForm } from '#testing/app/shared-examples/address-form.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('Change to inquiry address details', () => {
	const appealId = 2;

	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}?include=all`)
			.reply(200, { ...appealData, appealId })
			.persist();
	});

	appealData.procedureType = 'inquiry';

	afterEach(teardown);

	describe('GET /change-appeal-procedure-type/inquiry/address-details', () => {
		const appealId = 2;

		let bodyHtml;
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/address-details`
			);
			pageHtml = parseHtml(response.text);
			bodyHtml = parseHtml(response.text, { rootElement: 'body' });
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

		it('should have a back link to the address known page', () => {
			expect(bodyHtml.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/address-known`
			);
		});

		it('should have a back link to the CYA page if editing', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/address-details?editEntrypoint=` +
					'%2Fappeals-service%2Fappeal-details%2F2%2Fchange-appeal-procedure-type%2Finquiry%2Faddress-details'
			);
			const html = parseHtml(response.text, { rootElement: 'body' });
			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toContain(
				`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/check-and-confirm`
			);
		});
	});

	describe('POST /change-appeal-procedure-type/inquiry/address-details', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /inquiry/setup/timetable-due-dates with valid inputs', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/address-details`)
				.send({
					addressLine1: 'Flat 9',
					addressLine2: '123 Gerbil Drive',
					town: 'Blarberton',
					county: 'Slabshire',
					postCode: 'X25 3YZ'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/change-timetable`
			);
		});

		behavesLikeAddressForm({
			request,
			url: `${baseUrl}/${appealId}/change-appeal-procedure-type/inquiry/address-details`
		});
	});
});
