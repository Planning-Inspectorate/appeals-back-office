import { appealData, lpaQuestionnaireData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
const baseUrl = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`;

describe('eia-environmental-impact-schedule', () => {
	beforeEach(installMockApi), afterEach(teardown);

	describe('GET /change', () => {
		it('should render the development category change page with "Schedule 1" radio option checked if eiaEnvironmentalImpactSchedule is "schedule-1"', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireData,
					eiaEnvironmentalImpactSchedule: 'schedule-1'
				});
			const response = await request.get(`${baseUrl}/eia-environmental-impact-schedule/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('What is the development category?</h1>');

			const unprettifiedInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedInnerHtml).toContain(
				'name="eiaEnvironmentalImpactSchedule" type="radio" value="schedule-1" checked>'
			);
		});

		it('should render the development category change page with "Other" radio option checked if eiaEnvironmentalImpactSchedule is null', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireData,
					eiaEnvironmentalImpactSchedule: null
				});
			const response = await request.get(`${baseUrl}/eia-environmental-impact-schedule/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('What is the development category?</h1>');

			const unprettifiedInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedInnerHtml).toContain(
				'name="eiaEnvironmentalImpactSchedule" type="radio" value="other" checked>'
			);
		});
	});

	describe('POST /change', () => {
		it('should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "Schedule 1" is selected', async () => {
			const mockLPAQPatchEndpoint = nock('http://test/')
				.patch(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(`${baseUrl}/eia-environmental-impact-schedule/change`)
				.send({
					eiaEnvironmentalImpactSchedule: 'schedule-1'
				});

			expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}`
			);
		});

		it('should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "Other" is selected', async () => {
			const mockLPAQPatchEndpoint = nock('http://test/')
				.patch(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(`${baseUrl}/eia-environmental-impact-schedule/change`)
				.send({
					eiaEnvironmentalImpactSchedule: 'other'
				});

			expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}`
			);
		});
	});
});
