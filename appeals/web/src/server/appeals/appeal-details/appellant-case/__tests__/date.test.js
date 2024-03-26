import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import { appealData } from '#testing/app/fixtures/referencedata.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appellantCasePagePath = '/appellant-case';
const validOutcomePagePath = '/valid';
const validDatePagePath = '/date';

describe('appellant-case dates', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('POST /appellant-case/valid/date', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get(`/appeals/${appealData.appealId}`).reply(200, appealData).persist();
			nock('http://test/').patch(`/appeals/${appealData.appealId}`).reply(200);
			nock('http://test/')
				.patch('/appeals/1/appellant-cases/0')
				.reply(200, { validationOutcome: 'valid' });

			await request.post(`${baseUrl}/1${appellantCasePagePath}`).send({
				reviewOutcome: 'valid'
			});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the update date page with the expected error message if an invalid month was provided', async () => {
			let response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'due-date-day': '1',
					'due-date-month': '0',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'due-date-day': '1',
					'due-date-month': '13',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'due-date-day': '1',
					'due-date-month': 'dec',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
		});

		it('should re-render the update date page with the expected error message if an invalid month "0" was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'due-date-day': '1',
					'due-date-month': '0',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
		});

		it('should re-render the update date page with the expected error message if an invalid month "13" was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'due-date-day': '1',
					'due-date-month': '13',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
		});

		it('should re-render the update date page with the expected error message if an invalid month "dec" was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'due-date-day': '1',
					'due-date-month': 'dec',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
		});

		describe('Post to update date page with various invalid months', () => {
			const testCases = [
				{ day: '1', month: '0', year: '3000', description: 'month "0"' },
				{ day: '1', month: '13', year: '3000', description: 'month "13"' },
				{ day: '1', month: 'dec', year: '3000', description: 'month "dec"' }
			];
			testCases.forEach(({ day, month, year, description }) => {
				it(`should re-render the update date page with the expected error message if an invalid ${description} was provided`, async () => {
					const response = await request
						.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
						.send({
							'due-date-day': day,
							'due-date-month': month,
							'due-date-year': year
						});

					expect(response.statusCode).toBe(200);
					const element = parseHtml(response.text);
					expect(element.innerHTML).toMatchSnapshot();
				});
			});
		});
	});
});

nock('http://test/').get(`/appeals/${appealData.appealId}`).reply(200, appealData).persist();
