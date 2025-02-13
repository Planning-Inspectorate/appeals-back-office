import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import { appealData } from '#testing/appeals/appeals.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';

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
		it('should render the start case page with the expected content', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealDataWithoutStartDate);

			const response = await request.get(`${baseUrl}/1/start-case/add`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toContain('Start case</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				`Warning</span> Confirming will activate the timetable on ${dateISOStringToDisplayDate(
					new Date().toISOString()
				)}. Start letters will be sent to the relevant parties.`
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /start-case/add', () => {
		it('should redirect to appeal details page', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealDataWithoutStartDate);
			nock('http://test/').post(`/appeals/1/appeal-timetables`).reply(200, {});

			const response = await request.post(`${baseUrl}/1/start-case/add`).send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});
	describe('GET /start-case/change', () => {
		it('should render the change start date page with the expected content', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);

			const response = await request.get(`${baseUrl}/1/start-case/change`);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toContain('Change start date</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				`Warning</span> Confirming will change the start day to ${dateISOStringToDisplayDate(
					new Date().toISOString()
				)} and update the case timetable. New start letters will be sent to relevant parties.</strong>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /start-case/change', () => {
		it('should redirect to the appeal details page', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/').post(`/appeals/1/appeal-timetables`).reply(200, {});

			const response = await request.post(`${baseUrl}/1/start-case/change`).send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});
});
