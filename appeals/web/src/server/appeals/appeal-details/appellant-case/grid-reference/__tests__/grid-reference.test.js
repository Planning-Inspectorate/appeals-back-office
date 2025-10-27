import {
	appealData,
	appellantCaseDataIncompleteOutcome
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`;

describe('grid-reference', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the grid reference change page when accessed from the appellant case page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const response = await request.get(`${baseUrl}/grid-reference/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Enter the grid reference</h1>');
			expect(elementInnerHtml).toContain(
				'The grid reference should match what is on the application'
			);
			expect(elementInnerHtml).toContain('Easting');
			expect(elementInnerHtml).toContain('Northing');
		});
	});

	describe('POST /change', () => {
		it('should redirect to the appellant-case page when grid refs are valid', async () => {
			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const validData = {
				siteGridReferenceEasting: '654321',
				siteGridReferenceNorthing: '123456'
			};

			const response = await request.post(`${baseUrl}/grid-reference/change`).send(validData);

			expect(response.statusCode).toEqual(302);
			expect(apiCall.isDone()).toBe(true);
			expect(response.text).toBe(`Found. Redirecting to ${baseUrl}`);
		});

		it('should re-render the page with an error if the eastings field is empty', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const validData = {
				siteGridReferenceEasting: '',
				siteGridReferenceNorthing: '123456'
			};

			const response = await request.post(`${baseUrl}/grid-reference/change`).send(validData);
			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(apiCall.isDone()).toBe(false);

			expect(elementInnerHtml).toContain('Enter the grid reference</h1>');
			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Enter the eastings grid reference</a>');
		});

		it('should re-render the page with an error if the eastings field contains non-numeric characters', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const invalidData = {
				siteGridReferenceEasting: '12ab56',
				siteGridReferenceNorthing: '123456'
			};

			const response = await request.post(`${baseUrl}/grid-reference/change`).send(invalidData);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(response.statusCode).toEqual(400);
			expect(apiCall.isDone()).toBe(false);
			expect(elementInnerHtml).toContain('Enter the grid reference</h1>');
			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Eastings must only include numbers 0 to 9</a>');
		});

		it('should re-render the page with an error if the eastings field is too big', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const invalidData = {
				siteGridReferenceEasting: '700000',
				siteGridReferenceNorthing: '123456'
			};

			const response = await request.post(`${baseUrl}/grid-reference/change`).send(invalidData);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(apiCall.isDone()).toBe(false);
			expect(elementInnerHtml).toContain('Enter the grid reference</h1>');
			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Eastings must be 692200 or less</a>');
		});

		it('should re-render the page with an error if the eastings field is too short', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const invalidData = {
				siteGridReferenceEasting: '123',
				siteGridReferenceNorthing: '123456'
			};

			const response = await request.post(`${baseUrl}/grid-reference/change`).send(invalidData);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(apiCall.isDone()).toBe(false);
			expect(elementInnerHtml).toContain('Enter the grid reference</h1>');
			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Eastings must be at least 6 digits</a>');
		});

		it('should re-render the page with multiple errors if the eastings field has multiple issues', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const invalidData = {
				siteGridReferenceEasting: 'a3',
				siteGridReferenceNorthing: '123456'
			};

			const response = await request.post(`${baseUrl}/grid-reference/change`).send(invalidData);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(apiCall.isDone()).toBe(false);
			expect(elementInnerHtml).toContain('Enter the grid reference</h1>');
			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Eastings must only include numbers 0 to 9');
		});

		it('should re-render the page with an error if the northings field is empty', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const invalidData = {
				siteGridReferenceEasting: '123456',
				siteGridReferenceNorthing: ''
			};

			const response = await request.post(`${baseUrl}/grid-reference/change`).send(invalidData);
			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(apiCall.isDone()).toBe(false);
			expect(elementInnerHtml).toContain('Enter the grid reference</h1>');
			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Enter the northings grid reference</a>');
		});

		it('should re-render the page with an error if the northings field contains non-numeric characters', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const invalidData = {
				siteGridReferenceEasting: '123456',
				siteGridReferenceNorthing: '12ab56'
			};

			const response = await request.post(`${baseUrl}/grid-reference/change`).send(invalidData);
			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(apiCall.isDone()).toBe(false);
			expect(elementInnerHtml).toContain('Enter the grid reference</h1>');
			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Northings must only include numbers 0 to 9</a>');
		});

		it('should re-render the page with an error if the northings field is too big', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const invalidData = {
				siteGridReferenceEasting: '123456',
				siteGridReferenceNorthing: '1300000'
			};

			const response = await request.post(`${baseUrl}/grid-reference/change`).send(invalidData);
			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(apiCall.isDone()).toBe(false);
			expect(elementInnerHtml).toContain('Enter the grid reference</h1>');
			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Northings must be 1299999 or less</a>');
		});

		it('should re-render the page with an error if the northings field is too short', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const invalidData = {
				siteGridReferenceEasting: '123456',
				siteGridReferenceNorthing: '123'
			};

			const response = await request.post(`${baseUrl}/grid-reference/change`).send(invalidData);
			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(apiCall.isDone()).toBe(false);
			expect(elementInnerHtml).toContain('Enter the grid reference</h1>');
			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Northings must be at least 6 digits</a>');
		});

		it('should re-render the page with multiple errors if the northings field has multiple issues', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, { appellantCaseDataIncompleteOutcome });

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {});

			const invalidData = {
				siteGridReferenceEasting: '123456',
				siteGridReferenceNorthing: 'a3'
			};

			const response = await request.post(`${baseUrl}/grid-reference/change`).send(invalidData);
			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();
			expect(apiCall.isDone()).toBe(false);
			expect(elementInnerHtml).toContain('Enter the grid reference</h1>');
			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain('Northings must only include numbers 0 to 9');
		});
	});
});
