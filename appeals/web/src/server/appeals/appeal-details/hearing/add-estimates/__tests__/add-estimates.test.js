// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

/**
 * Creates validation test cases for a field that allows days or half days
 * @param {string} fieldName - The name of the field being tested
 * @param {string} label - The label used in error messages
 * @param {Object} validValues - The valid values for other fields
 * @returns {() => void} A function that runs the validation test cases
 */
const behavesLikeADayOrHalfDayField = (fieldName, label, validValues) => {
	return () => {
		it('should return 400 when field is empty', async () => {
			const response = await request
				.post(`${baseUrl}/2/hearing/add-estimates/estimates`)
				.send({ ...validValues, [fieldName]: '' });

			expect(response.statusCode).toBe(400);
			expect(response.text).toContain(`Enter estimated ${label}`);
		});

		it('should return 400 when field is not numeric', async () => {
			const response = await request
				.post(`${baseUrl}/2/hearing/add-estimates/estimates`)
				.send({ ...validValues, [fieldName]: 'abc' });

			expect(response.statusCode).toBe(400);
			expect(response.text).toContain(`Estimated ${label} must be a number`);
		});

		it('should return 400 when field is negative', async () => {
			const response = await request
				.post(`${baseUrl}/2/hearing/add-estimates/estimates`)
				.send({ ...validValues, [fieldName]: '-1' });

			expect(response.statusCode).toBe(400);
			expect(response.text).toContain(`Estimated ${label} must be between 0 and 99`);
		});

		it('should return 400 when field is greater than 99', async () => {
			const response = await request
				.post(`${baseUrl}/2/hearing/add-estimates/estimates`)
				.send({ ...validValues, [fieldName]: '100' });

			expect(response.statusCode).toBe(400);
			expect(response.text).toContain(`Estimated ${label} must be between 0 and 99`);
		});

		it('should return 400 when field is not in increments of 0.5', async () => {
			const response = await request
				.post(`${baseUrl}/2/hearing/add-estimates/estimates`)
				.send({ ...validValues, [fieldName]: '1.2' });

			expect(response.statusCode).toBe(400);
			expect(response.text).toContain(`Estimated ${label} must be in increments of 0.5`);
		});

		it('should accept field in increments of 0.5', async () => {
			const response = await request
				.post(`${baseUrl}/2/hearing/add-estimates/estimates`)
				.send({ ...validValues, [fieldName]: '1.5' });

			expect(response.statusCode).toBe(302);
		});
	};
};

describe('add estimates', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /hearing/add-estimates', () => {
		// eslint-disable-next-line jest/expect-expect
		it('should redirect to /hearing/add-estimates/estimates', () => {
			return new Promise((resolve) => {
				request
					.get(`${baseUrl}/2/hearing/add-estimates`)
					.expect(302)
					.expect('Location', `${baseUrl}/2/hearing/add-estimates/estimates`)
					.end(resolve);
			});
		});
	});

	describe('GET /hearing/add-estimates/estimates', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/hearing/add-estimates/estimates`);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Hearing estimates');
		});

		it('should render preparation time field', () => {
			expect(pageHtml.querySelector('input#preparation-time')).not.toBeNull();
		});

		it('should render sitting time field', () => {
			expect(pageHtml.querySelector('input#sitting-time')).not.toBeNull();
		});

		it('should render reporting time field', () => {
			expect(pageHtml.querySelector('input#reporting-time')).not.toBeNull();
		});

		it('should render any saved response', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/hearing/add-estimates/estimates`).send({
				'preparation-time': '2',
				'sitting-time': '3',
				'reporting-time': '1'
			});

			const response = await request.get(`${baseUrl}/${appealId}/hearing/add-estimates/estimates`);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#preparation-time').getAttribute('value')).toEqual('2');
			expect(pageHtml.querySelector('input#sitting-time').getAttribute('value')).toEqual('3');
			expect(pageHtml.querySelector('input#reporting-time').getAttribute('value')).toEqual('1');
		});
	});

	describe('POST /hearing/add-estimates/estimates', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /hearing/add-estimates/check-details with valid inputs', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/hearing/add-estimates/estimates`)
				.send({
					'preparation-time': '2',
					'sitting-time': '3',
					'reporting-time': '1'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/hearing/add-estimates/check-details`
			);
		});

		describe('Preparation time validation', () => {
			behavesLikeADayOrHalfDayField('preparation-time', 'preparation time', {
				'sitting-time': '3',
				'reporting-time': '1'
			})();
		});

		describe('Sitting time validation', () => {
			behavesLikeADayOrHalfDayField('sitting-time', 'sitting time', {
				'preparation-time': '2',
				'reporting-time': '1'
			})();
		});

		describe('Reporting time validation', () => {
			behavesLikeADayOrHalfDayField('reporting-time', 'reporting time', {
				'preparation-time': '2',
				'sitting-time': '3'
			})();
		});
	});
});
