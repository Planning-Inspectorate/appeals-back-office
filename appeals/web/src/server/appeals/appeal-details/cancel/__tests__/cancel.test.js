import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import { appealData } from '#testing/appeals/appeals.js';

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
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain(`Why are you cancelling the appeal?</h1>`);
			expect(unprettifiedElement.innerHTML).toContain('name="cancelReasonRadio"');
			expect(unprettifiedElement.innerHTML).toContain('Appeal invalid</label>');
			expect(unprettifiedElement.innerHTML).toContain('Request to withdraw appeal</label>');
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /new', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
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
				'Found. Redirecting to /appeals-service/appeal-details/1/withdrawal/start'
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
