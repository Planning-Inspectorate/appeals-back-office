import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import { appealData } from '#testing/app/fixtures/referencedata.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('add-ip-comment', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /add', () => {
		it('should redirect to /add/ip-details', () => {
			return new Promise((resolve) => {
				request
					.get(`${baseUrl}/2/interested-party-comments/add`)
					.expect(302)
					.expect('Location', `./add/ip-details`)
					.end(resolve);
			});
		});
	});

	describe('GET /add/ip-details', () => {
		const appealId = 2;

		/** @type {*} */
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`
			);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML).toBe('Interested party&#39;s details');
		});

		it('should render a First name field', () => {
			expect(pageHtml.querySelector('input#first-name')).not.toBeNull();
		});

		it('should render a Last name field', () => {
			expect(pageHtml.querySelector('input#last-name')).not.toBeNull();
		});

		it('should render an Email address field', () => {
			expect(pageHtml.querySelector('input#email-address')).not.toBeNull();
		});
	});

	describe('GET /add/check-address', () => {
		const appealId = 2;

		/** @type {*} */
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-address`
			);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML).toBe(
				'Did the interested party provide an address?'
			);
		});

		it('should render Yes and No radio buttons', () => {
			expect(pageHtml.querySelector('input[type="radio"][value="yes"]')).not.toBeNull();
			expect(pageHtml.querySelector('input[type="radio"][value="no"]')).not.toBeNull();
		});
	});

	describe('GET /add/ip-address', () => {
		const appealId = 2;

		/** @type {*} */
		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`
			);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML).toBe('Interested party&#39;s address');
		});

		it('should render an Address line 1 field', () => {
			expect(pageHtml.querySelector('input#address-line-1')).not.toBeNull();
		});

		it('should render an Address line 2 field', () => {
			expect(pageHtml.querySelector('input#address-line-2')).not.toBeNull();
		});

		it('should render a Town or city field', () => {
			expect(pageHtml.querySelector('input#address-town')).not.toBeNull();
		});

		it('should render a County field', () => {
			expect(pageHtml.querySelector('input#address-county')).not.toBeNull();
		});

		it('should render a Postcode field', () => {
			expect(pageHtml.querySelector('input#address-postcode')).not.toBeNull();
		});
	});

	describe('POST /add/ip-details', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to the next step when all fields are correctly populated', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`)
				.send({ firstName: 'First', lastName: 'Last', emailAddress: 'example@email.com' });

			expect(response.statusCode).toBe(302);
		});

		it('should redirect to the next step when only the required fields are populated', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`)
				.send({ firstName: 'First', lastName: 'Last' });

			expect(response.statusCode).toBe(302);
		});

		it('should return 400 when required fields are missing', async () => {
			const response = await request.post(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`
			);
			expect(response.statusCode).toBe(400);
		});

		it('should return 400 when fields are entered incorrectly', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`)
				.send({ firstName: 'First', lastName: 'Last', emailAddress: 'invalid' });

			expect(response.statusCode).toBe(400);
		});
	});

	describe('POST /add/check-address', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to the next step when Yes is selected', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/check-address`)
				.send({ addressProvided: 'yes' });

			expect(response.statusCode).toBe(302);
		});

		it('should redirect to the next step when No is selected', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/check-address`)
				.send({ addressProvided: 'no' });

			expect(response.statusCode).toBe(302);
		});

		it('should return 400 when no option is selected', async () => {
			const response = await request.post(
				`${baseUrl}/${appealId}/interested-party-comments/add/check-address`
			);
			expect(response.statusCode).toBe(400);
		});
	});

	describe('POST /add/ip-address', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to the next step when all fields are populated correctly', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`)
				.send({
					addressLine1: 'Line 1',
					addressLine2: 'Line 2',
					town: 'Town',
					county: 'County',
					postCode: 'AB1 2CD'
				});

			expect(response.statusCode).toBe(302);
		});

		it('should redirect to the next step when only required fields are populated', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`)
				.send({
					addressLine1: 'Line 1',
					town: 'Town',
					postCode: 'AB1 2CD'
				});

			expect(response.statusCode).toBe(302);
		});

		it('should return 400 when required fields are missing', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`)
				.send({
					town: 'Town',
					postCode: 'AB1 2CD'
				});

			expect(response.statusCode).toBe(400);
		});

		it('should return 400 when fields are entered incorrectly', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/interested-party-comments/add/ip-address`)
				.send({
					addressLine1: 'Line 1',
					town: 'Town',
					postCode: 'invalid'
				});

			expect(response.statusCode).toBe(400);
		});
	});
});
