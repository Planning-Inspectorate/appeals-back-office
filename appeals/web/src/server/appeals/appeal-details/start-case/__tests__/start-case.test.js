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
	beforeEach(() => {
		nock('http://test/').get('/appeals/1').reply(200, appealDataWithoutStartDate);
	});
	afterEach(teardown);

	describe('GET /start-case/add', () => {
		it('"Start case" page should contain "Confirming will activate the timetable on"', async () => {
			const response = await request.get(`${baseUrl}/1/start-case/add`);
			expect(response.text).toContain('Confirming will activate the timetable on');
		});

		it('should redirect to the confirmation page', async () => {
			nock('http://test/').post(`/appeals/1/appeal-timetables`).reply(200, {});
			const response = await request.post(`${baseUrl}/1/start-case/add`).send({});
			expect(response.statusCode).toBe(302);
		});
	});

	describe('GET /start-case/confirmation', () => {
		it('should render "Case started" confirmation page', async () => {
			const response = await request.get(`${baseUrl}/1/start-case/confirmation`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
		});
	});
});
