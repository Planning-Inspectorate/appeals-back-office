import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const errorRoot = '.govuk-error-summary';

describe('site-address', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /add', () => {
		it('should render updateSiteAddress page', async () => {
			const appealId = appealData.appealId.toString();
			const response = await request.get(
				`${baseUrl}/${appealId}/appellant-case/site-address/change/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('What is the address of the appeal site?</h1>');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change/:siteId', () => {
		it('should re-render updateSiteAddress page if addressLine1 is null', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: null,
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-address/change/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text, { rootElement: errorRoot });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain(
				'Enter address line 1, typically the building and street</a>'
			);
		});

		it('should re-render updateSiteAddress page if addressLine1 is an empty string', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-address/change/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text, { rootElement: errorRoot });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain(
				'Enter address line 1, typically the building and street</a>'
			);
		});

		it('should re-render updateSiteAddress page if town is null', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: null,
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-address/change/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text, { rootElement: errorRoot });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Enter town or city</a>');
		});

		it('should re-render updateSiteAddress page if town is an empty string', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: '',
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-address/change/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text, { rootElement: errorRoot });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Enter town or city</a>');
		});

		it('should re-render updateSiteAddress page if the postcode is null', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: null
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-address/change/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text, { rootElement: errorRoot });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Enter a full UK postcode</a>');
		});

		it('should re-render updateSiteAddress page if the postcode is invalid', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: '111'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-address/change/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text, { rootElement: errorRoot });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Invalid postcode</a>');
		});

		it('should re-render updateSiteAddress page if the postcode is an empty string', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: ''
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-address/change/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text, { rootElement: errorRoot });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Enter a full UK postcode</a>');
		});

		it('should redirect to the appellant case page', async () => {
			const appealId = appealData.appealId.toString();
			nock('http://test/').patch(`/appeals/${appealId}/addresses/1`).reply(200, {
				addressLine1: '1 Grove Cottage',
				county: 'Devon',
				postcode: 'NR35 2ND',
				town: 'Woodton'
			});
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-case`)
				.reply(200, appealData);

			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/site-address/change/1`)
				.send({
					addressLine1: '1 Grove Cottage',
					county: 'Devon',
					postCode: 'NR35 2ND',
					town: 'Woodton'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});
	});
});
