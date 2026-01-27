import { appealData, appealDataEnforcementNotice } from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const cancelPath = '/cancel';
const mockAppealId = '1';

describe('cancel', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /new', () => {
		it('should render the cancel appeal page with radio components', async () => {
			const response = await request.get(`${baseUrl}/${mockAppealId}${cancelPath}`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Why are you cancelling the appeal?'
			);
			expect(element.querySelectorAll('[name="cancelReasonRadio"]').length).toBe(2);
			expect(element.querySelector('label[for="cancel-reason-radio"]')?.innerHTML.trim()).toBe(
				'Appeal invalid'
			);
			expect(element.querySelector('label[for="cancel-reason-radio-2"]')?.innerHTML.trim()).toBe(
				'Request to withdraw appeal'
			);
			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Continue');
		});

		it('should render the correct options for an enforcement notice appeal', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, { ...appealDataEnforcementNotice });

			const response = await request.get(`${baseUrl}/${mockAppealId}${cancelPath}`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			expect(element.querySelector('h1')?.innerHTML.trim()).toBe(
				'Why are you cancelling the appeal?'
			);
			expect(element.querySelectorAll('[name="cancelReasonRadio"]').length).toBe(4);
			expect(element.querySelector('label[for="cancel-reason-radio"]')?.innerHTML.trim()).toBe(
				'Appeal invalid'
			);
			expect(element.querySelector('label[for="cancel-reason-radio-2"]')?.innerHTML.trim()).toBe(
				'LPA has withdrawn the enforcement notice'
			);
			expect(element.querySelector('label[for="cancel-reason-radio-3"]')?.innerHTML.trim()).toBe(
				'Did not pay the ground (a) fee'
			);
			expect(element.querySelector('label[for="cancel-reason-radio-4"]')?.innerHTML.trim()).toBe(
				'Request to withdraw appeal'
			);
			expect(element.querySelector('button')?.innerHTML.trim()).toBe('Continue');
		});
	});

	describe('POST /new', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should redirect to the new invalid page if cancelReasonRadio is present in the request body and set to invalid', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'invalid'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/invalid/new'
			);
		});

		it('should redirect to the start withdrawal page if cancelReasonRadio is present in the request body and set to withdrawal', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'withdrawal'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/withdrawal/new'
			);
		});

		it('should redirect to the correct page if enforcement-notice-withdrawn selected', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'enforcement-notice-withdrawn'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/cancel/enforcement-notice-withdrawal'
			);
		});

		it('should redirect to the correct page if did-not-pay selected', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'did-not-pay'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/cancel/check-details'
			);
		});

		it('should render cancel appeal page with errors if cancelReasonRadio is not present in request body', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<h2 class="govuk-error-summary__title"> There is a problem</h2>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Select why you are cancelling the appeal</p>'
			);
		});

		it('should render a 500 error page if cancelReasonRadio is present in the request body but not set to a valid value', async () => {
			const response = await request.post(`${baseUrl}/${mockAppealId}${cancelPath}`).send({
				cancelReasonRadio: 'something'
			});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});
	});
});
