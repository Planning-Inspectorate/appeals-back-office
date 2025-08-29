import {
	appealData,
	lpaNotificationMethodsData,
	lpaQuestionnaireData
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealId = appealData.appealId;
const lpaQuestionnaireId = appealData.lpaQuestionnaireId;

describe('notification-methods', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
			.reply(200, {
				...lpaQuestionnaireData
			});
		nock('http://test/')
			.get('/appeals/lpa-notification-methods')
			.reply(200, lpaNotificationMethodsData);
	});
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the change notification methods page with the expected content, and with the correct checkboxes checked, according to the existing notification methods in the lpa questionnaire data', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/notification-methods/change`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'How did you notify relevant parties about the application?</h1>'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="notificationMethodsCheckboxes" type="checkbox" value="9029" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="notificationMethodsCheckboxes" type="checkbox" value="9030" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="notificationMethodsCheckboxes" type="checkbox" value="9031">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		it('should send a patch request containing an lpaNotificationMethods property with value of an empty array to the lpa-questionnaires endpoint, and redirect to the LPA questionnaire page, when no notification method checkboxes are checked', async () => {
			let endpointRequestBody;
			const mockEndpoint = nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply((uri, requestBody) => {
					endpointRequestBody = requestBody;
					return [200, {}];
				});

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/notification-methods/change`
				)
				.send({});

			expect(endpointRequestBody).toEqual({
				lpaNotificationMethods: []
			});
			expect(mockEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1'
			);
		});

		it('should send a patch request containing an lpaNotificationMethods property with value of an array containing an object with the id of the chosen notification method to the lpa-questionnaires endpoint, and redirect to the LPA questionnaire page, when a single notification method checkboxes is checked', async () => {
			let endpointRequestBody;
			const mockEndpoint = nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply((uri, requestBody) => {
					endpointRequestBody = requestBody;
					return [200, {}];
				});

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/notification-methods/change`
				)
				.send({ notificationMethodsCheckboxes: '9029' });

			expect(endpointRequestBody).toEqual({
				lpaNotificationMethods: [{ id: 9029 }]
			});
			expect(mockEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1'
			);
		});

		it('should send a patch request containing an lpaNotificationMethods property with value of an array containing objects with the ids of the chosen notification methods to the lpa-questionnaires endpoint, and redirect to the LPA questionnaire page, when multiple notification method checkboxes are checked', async () => {
			let endpointRequestBody;
			const mockEndpoint = nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply((uri, requestBody) => {
					endpointRequestBody = requestBody;
					return [200, {}];
				});

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/notification-methods/change`
				)
				.send({ notificationMethodsCheckboxes: ['9030', '9031'] });

			expect(endpointRequestBody).toEqual({
				lpaNotificationMethods: [{ id: 9030 }, { id: 9031 }]
			});
			expect(mockEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1'
			);
		});
	});
});
