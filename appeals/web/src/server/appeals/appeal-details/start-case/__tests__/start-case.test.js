import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import { appealData } from '#testing/appeals/appeals.js';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealDataWithoutStartDate = {
	...appealData,
	startedAt: null
};

describe('start-case', () => {
	afterEach(teardown);

	describe('GET /start-case/add', () => {
		it('"Start case" page should contain "Confirming will activate the timetable on"', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealDataWithoutStartDate);
			const response = await request.get(`${baseUrl}/1/start-case/add`);
			expect(response.text).toContain('Confirming will activate the timetable on');
		});

		it('should redirect to the confirmation page', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealDataWithoutStartDate);
			nock('http://test/').post(`/appeals/1/appeal-timetables`).reply(200, {});
			const response = await request.post(`${baseUrl}/1/start-case/add`).send({});
			expect(response.statusCode).toBe(302);
		});
	});

	describe('GET /start-case/add/confirmation', () => {
		it('should render "Case started" confirmation page', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealDataWithoutStartDate);
			const response = await request.get(`${baseUrl}/1/start-case/add/confirmation`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Case started');
			expect(element.innerHTML).toContain('Case reference number');
			expect(element.innerHTML).toContain(
				'Case timetable activated. The relevant parties have been informed.'
			);
		});
	});

	describe('GET /start-case/change', () => {
		it('"Start case" page should contain "Confirming will change the start day to"', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			const response = await request.get(`${baseUrl}/1/start-case/change`);
			expect(response.text).toContain('Confirming will change the start day to');
		});

		it('should redirect to the confirmation page', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/').post(`/appeals/1/appeal-timetables`).reply(200, {});
			const response = await request.post(`${baseUrl}/1/start-case/change`).send({});
			expect(response.statusCode).toBe(302);
		});
	});

	describe('GET /start-case/change/confirmation', () => {
		it('should render "Start date changed" confirmation page', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			const response = await request.get(`${baseUrl}/1/start-case/change/confirmation`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Start date changed');
			expect(element.innerHTML).toContain('Case reference number');
			expect(element.innerHTML).toContain(
				'Case timetable updated. The relevant parties have been informed.'
			);
		});
	});
});
