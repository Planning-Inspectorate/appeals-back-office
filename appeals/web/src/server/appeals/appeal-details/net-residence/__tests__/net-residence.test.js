import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('net-residence', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /residential-units/new', () => {
		it('should render net gain or loss of residential units', async () => {
			const appealId = appealData.appealId.toString();
			const response = await request.get(`${baseUrl}/${appealId}/residential-units/new`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
		});
	});

	describe('POST /residential-units/new', () => {
		it('should re-direct appeal details page when no change in net residence selected', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const validData = {
				'net-residence': 'noChange'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1/');
		});

		it('should re-direct appeal details page when valid net gain provided', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const validData = {
				'net-residence': 'gain',
				'net-gain': '5'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1/');
		});

		it('should re-direct appeal details page when valid net loss provided', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const validData = {
				'net-residence': 'loss',
				'net-loss': '5'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1/');
		});

		it('should re-direct appeal details page when net gain selected', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const validData = {
				'net-residence': 'gain',
				'net-gain': '5'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1/');
		});

		it('should re-direct appeal details page when net loss selected', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const validData = {
				'net-residence': 'loss',
				'net-loss': '5'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1/');
		});

		it('should return error when radio button not selected', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const invalidData = {
				'net-residence': ''
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(invalidData);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				`<a href="#net-residence">Select if there is a net gain or loss of residential units</a>`
			);
		});

		it('should return error when net gain radio button selected but no net gain entered', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const invalidData = {
				'net-residence': 'gain',
				'net-gain': ''
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(invalidData);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(`<a href="#net-gain">Enter the net gain</a>`);
		});

		it('should return error when net gain radio button selected and text is entered', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const invalidData = {
				'net-residence': 'gain',
				'net-gain': 'asdffe'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(invalidData);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				`<a href="#net-gain">Net gain must be a number, like 5</a>`
			);
		});

		it('should return error when net gain radio button selected and decimal entered', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const invalidData = {
				'net-residence': 'gain',
				'net-gain': '1.43'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(invalidData);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				`<a href="#net-gain">Net gain must be a whole number, like 5</a>`
			);
		});

		it('should return error when net loss radio button selected but no net gain entered', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const invalidData = {
				'net-residence': 'loss',
				'net-loss': ''
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(invalidData);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(`<a href="#net-loss">Enter the net loss</a>`);
		});

		it('should return error when net loss radio button selected and text is entered', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const invalidData = {
				'net-residence': 'loss',
				'net-loss': 'asdffe'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(invalidData);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				`<a href="#net-loss">Net loss must be a number, like 5</a>`
			);
		});

		it('should return error when net loss radio button selected and decimal entered', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').patch(`/appeals/1/appellant-cases/0`).reply(200, {});

			const invalidData = {
				'net-residence': 'loss',
				'net-loss': '1.43'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/residential-units/new`)
				.send(invalidData);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				`<a href="#net-loss">Net loss must be a whole number, like 5</a>`
			);
		});
	});
});
