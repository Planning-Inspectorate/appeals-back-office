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
				.post(`${baseUrl}/2/inquiry/estimates/add/timings`)
				.send({ ...validValues, [fieldName]: '' });

			expect(response.statusCode).toBe(400);
			expect(response.text).toContain(`Enter estimated ${label}`);
		});

		it('should return 400 when field is not numeric', async () => {
			const response = await request
				.post(`${baseUrl}/2/inquiry/estimates/add/timings`)
				.send({ ...validValues, [fieldName]: 'abc' });

			expect(response.statusCode).toBe(400);
			expect(response.text).toContain(`Estimated ${label} must be a number`);
		});

		it('should return 400 when field is negative', async () => {
			const response = await request
				.post(`${baseUrl}/2/inquiry/estimates/add/timings`)
				.send({ ...validValues, [fieldName]: '-1' });

			expect(response.statusCode).toBe(400);
			expect(response.text).toContain(`Estimated ${label} must be between 0 and 99`);
		});

		it('should return 400 when field is greater than 99', async () => {
			const response = await request
				.post(`${baseUrl}/2/inquiry/estimates/add/timings`)
				.send({ ...validValues, [fieldName]: '100' });

			expect(response.statusCode).toBe(400);
			expect(response.text).toContain(`Estimated ${label} must be between 0 and 99`);
		});

		it('should return 400 when field is not in increments of 0.5', async () => {
			const response = await request
				.post(`${baseUrl}/2/inquiry/estimates/add/timings`)
				.send({ ...validValues, [fieldName]: '1.2' });

			expect(response.statusCode).toBe(400);
			expect(response.text).toContain(`Estimated ${label} must be in increments of 0.5`);
		});

		it('should accept field in increments of 0.5', async () => {
			const response = await request
				.post(`${baseUrl}/2/inquiry/estimates/add/timings`)
				.send({ ...validValues, [fieldName]: '1.5' });

			expect(response.statusCode).toBe(302);
		});
	};
};

describe('add estimates', () => {
	beforeEach(() => {
		installMockApi();
	});

	afterEach(() => {
		teardown();
		nock.cleanAll();
	});

	describe('GET /inquiry/estimates/add', () => {
		// eslint-disable-next-line jest/expect-expect
		it('should redirect to /inquiry/estimates/add/timings', () => {
			return new Promise((resolve) => {
				request
					.get(`${baseUrl}/2/inquiry/estimates/add`)
					.expect(302)
					.expect('Location', `${baseUrl}/2/inquiry/estimates/add/timings`)
					.end(resolve);
			});
		});
	});

	describe('GET /inquiry/estimates/add/timings', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/estimates/add/timings`);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Inquiry estimates');
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
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/inquiry/estimates/add/timings`).send({
				preparationTime: '2',
				sittingTime: '3',
				reportingTime: '1'
			});

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/estimates/add/timings`);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#preparation-time').getAttribute('value')).toEqual('2');
			expect(pageHtml.querySelector('input#sitting-time').getAttribute('value')).toEqual('3');
			expect(pageHtml.querySelector('input#reporting-time').getAttribute('value')).toEqual('1');
		});
	});

	describe('POST /inquiry/estimates/add/timings', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to /inquiry/estimates/add/check-details with valid inputs', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/inquiry/estimates/add/timings`)
				.send({
					preparationTime: '2',
					sittingTime: '3',
					reportingTime: '1'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/inquiry/estimates/add/check-details`
			);
		});

		describe('Preparation time validation', () => {
			behavesLikeADayOrHalfDayField('preparationTime', 'preparation time', {
				sittingTime: '3',
				reportingTime: '1'
			})();
		});

		describe('Sitting time validation', () => {
			behavesLikeADayOrHalfDayField('sittingTime', 'sitting time', {
				preparationTime: '2',
				reportingTime: '1'
			})();
		});

		describe('Reporting time validation', () => {
			behavesLikeADayOrHalfDayField('reportingTime', 'reporting time', {
				preparationTime: '2',
				sittingTime: '3'
			})();
		});
	});

	describe('GET /inquiry/estimates/add/check-details', () => {
		const appealId = 1;
		const estimates = {
			preparationTime: '1.5',
			sittingTime: '2.0',
			reportingTime: '1.0'
		};

		let pageHtml;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			// set session data with post request to previous page
			await request.post(`${baseUrl}/${appealId}/inquiry/estimates/add/timings`).send(estimates);

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/estimates/add/check-details`
			);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Check details and add inquiry estimates'
			);
		});

		it('should render the correct button text', () => {
			expect(pageHtml.querySelector('button')?.innerHTML.trim()).toBe('Add inquiry estimates');
		});
	});

	describe('POST /inquiry/estimates/add/check-details', () => {
		const appealId = 1;
		const estimates = {
			preparationTime: '1.5',
			sittingTime: '2.0',
			reportingTime: '1.0'
		};

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });
		});

		it('should redirect to appeal details page after successful submission', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/inquiry-estimates`, {
					preparationTime: 1.5,
					sittingTime: 2.0,
					reportingTime: 1.0
				})
				.reply(201, { inquiryEstimateId: 1 });

			// set session data with post request to previous page
			await request.post(`${baseUrl}/${appealId}/inquiry/estimates/add/timings`).send(estimates);

			const response = await request
				.post(`${baseUrl}/${appealId}/inquiry/estimates/add/check-details`)
				.send(estimates);

			expect(response.status).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should show 404 page if error is the session data is not present', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/inquiry-estimates`, {
					preparationTime: 1.5,
					sittingTime: 2.0,
					reportingTime: 1.0
				})
				.reply(500, { error: 'Internal Server Error' });

			const response = await request
				.post(`${baseUrl}/${appealId}/inquiry/estimates/add/check-details`)
				.send(estimates);

			expect(response.status).toBe(404);
			expect(response.text).toContain('You cannot check these answers');
		});

		it('should show 500 page if error is thrown', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/inquiry-estimates`, {
					preparationTime: 1.5,
					sittingTime: 2.0,
					reportingTime: 1.0
				})
				.reply(500, { error: 'Internal Server Error' });

			// set session data with post request to previous page
			await request.post(`${baseUrl}/${appealId}/inquiry/estimates/add/timings`).send(estimates);

			const response = await request
				.post(`${baseUrl}/${appealId}/inquiry/estimates/add/check-details`)
				.send(estimates);

			expect(response.status).toBe(500);
			expect(response.text).toContain('Sorry, there is a problem with the service');
		});
	});
});

describe('change estimates', () => {
	beforeEach(() => {
		installMockApi();
	});

	afterEach(() => {
		teardown();
		nock.cleanAll();
	});

	const appealWithEstimates = {
		...appealData,
		inquiryEstimate: {
			preparationTime: 4,
			sittingTime: 5,
			reportingTime: 0.5
		}
	};

	describe('GET /inquiry/estimates/change', () => {
		// eslint-disable-next-line jest/expect-expect
		it('should redirect to /inquiry/estimates/change/timings', () => {
			return new Promise((resolve) => {
				request
					.get(`${baseUrl}/2/inquiry/estimates/change`)
					.expect(302)
					.expect('Location', `${baseUrl}/2/inquiry/estimates/change/timings`)
					.end(resolve);
			});
		});
	});

	describe('GET /inquiry/estimates/change/timings', () => {
		const appealId = 2;

		let pageHtml;

		beforeAll(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithEstimates, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/estimates/change/timings`);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe('Inquiry estimates');
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
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithEstimates, appealId });
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithEstimates, appealId });

			//set session data with post request
			await request.post(`${baseUrl}/${appealId}/inquiry/estimates/change/timings`).send({
				preparationTime: '2',
				sittingTime: '3',
				reportingTime: '1'
			});

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/estimates/change/timings`);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#preparation-time').getAttribute('value')).toEqual('2');
			expect(pageHtml.querySelector('input#sitting-time').getAttribute('value')).toEqual('3');
			expect(pageHtml.querySelector('input#reporting-time').getAttribute('value')).toEqual('1');
		});

		it('should render existing values if no session data is present', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithEstimates, appealId });
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithEstimates, appealId });

			const response = await request.get(`${baseUrl}/${appealId}/inquiry/estimates/change/timings`);

			pageHtml = parseHtml(response.text);

			expect(pageHtml.querySelector('input#preparation-time').getAttribute('value')).toEqual('4');
			expect(pageHtml.querySelector('input#sitting-time').getAttribute('value')).toEqual('5');
			expect(pageHtml.querySelector('input#reporting-time').getAttribute('value')).toEqual('0.5');
		});
	});

	describe('POST /inquiry/estimates/change/timings', () => {
		const appealId = 2;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithEstimates, appealId });
		});

		it('should redirect to /inquiry/estimates/change/check-details with valid inputs', async () => {
			const response = await request
				.post(`${baseUrl}/${appealId}/inquiry/estimates/change/timings`)
				.send({
					preparationTime: '2',
					sittingTime: '3',
					reportingTime: '1'
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toBe(
				`${baseUrl}/${appealId}/inquiry/estimates/change/check-details`
			);
		});

		describe('Preparation time validation', () => {
			behavesLikeADayOrHalfDayField('preparationTime', 'preparation time', {
				sittingTime: '3',
				reportingTime: '1'
			})();
		});

		describe('Sitting time validation', () => {
			behavesLikeADayOrHalfDayField('sittingTime', 'sitting time', {
				preparationTime: '2',
				reportingTime: '1'
			})();
		});

		describe('Reporting time validation', () => {
			behavesLikeADayOrHalfDayField('reportingTime', 'reporting time', {
				preparationTime: '2',
				sittingTime: '3'
			})();
		});
	});

	describe('GET /inquiry/estimates/change/check-details', () => {
		const appealId = 1;
		const estimates = {
			preparationTime: '1.5',
			sittingTime: '2.0',
			reportingTime: '1.0'
		};

		let pageHtml;

		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealData, appealId });

			// set session data with post request to previous page
			await request.post(`${baseUrl}/${appealId}/inquiry/estimates/change/timings`).send(estimates);

			const response = await request.get(
				`${baseUrl}/${appealId}/inquiry/estimates/change/check-details`
			);
			pageHtml = parseHtml(response.text);
		});

		it('should match the snapshot', () => {
			expect(pageHtml.innerHTML).toMatchSnapshot();
		});

		it('should render the correct heading', () => {
			expect(pageHtml.querySelector('h1')?.innerHTML.trim()).toBe(
				'Check details and update inquiry estimates'
			);
		});

		it('should render the correct button text', () => {
			expect(pageHtml.querySelector('button')?.innerHTML.trim()).toBe('Update inquiry estimates');
		});
	});

	describe('POST /inquiry/estimates/change/check-details', () => {
		const appealId = 1;
		const estimates = {
			preparationTime: '1.5',
			sittingTime: '2.0',
			reportingTime: '1.0'
		};

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, { ...appealWithEstimates, appealId });
		});

		it('should redirect to appeal details page after successful submission', async () => {
			nock('http://test/')
				.patch(`/appeals/${appealId}/inquiry-estimates`, {
					preparationTime: 1.5,
					sittingTime: 2.0,
					reportingTime: 1.0
				})
				.reply(201, { inquiryEstimateId: 1 });

			// set session data with post request to previous page
			await request.post(`${baseUrl}/${appealId}/inquiry/estimates/change/timings`).send(estimates);

			const response = await request.post(
				`${baseUrl}/${appealId}/inquiry/estimates/change/check-details`
			);

			expect(response.status).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should show 404 page if error is the session data is not present', async () => {
			const response = await request.post(
				`${baseUrl}/${appealId}/inquiry/estimates/change/check-details`
			);

			expect(response.status).toBe(404);
			expect(response.text).toContain('You cannot check these answers');
		});

		it('should show 500 page if error is thrown', async () => {
			nock('http://test/')
				.post(`/appeals/${appealId}/inquiry-estimates`)
				.reply(500, { error: 'Internal Server Error' });

			// set session data with post request to previous page
			await request.post(`${baseUrl}/${appealId}/inquiry/estimates/change/timings`).send(estimates);

			const response = await request.post(
				`${baseUrl}/${appealId}/inquiry/estimates/change/check-details`
			);

			expect(response.status).toBe(500);
			expect(response.text).toContain('Sorry, there is a problem with the service');
		});
	});
});
