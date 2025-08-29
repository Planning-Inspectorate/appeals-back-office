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

describe('eia-development-description', () => {
	beforeEach(installMockApi), afterEach(teardown);

	describe('GET /change', () => {
		it('should render the development description change page with "Agriculture aquaculture" radio option checked if eiaDevelopmentDescription is "agriculture-aquaculture"', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireData,
					eiaDevelopmentDescription: 'agriculture-aquaculture'
				});
			const response = await request.get(`${baseUrl}/eia-development-description/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Description of development</h1>');

			const unprettifiedInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedInnerHtml).toContain(
				'name="eiaDevelopmentDescription" type="radio" value="agriculture-aquaculture" checked>'
			);
		});
	});

	describe('POST /change', () => {
		it('should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "Agriculture aquaculture" is selected', async () => {
			const mockLPAQPatchEndpoint = nock('http://test/')
				.patch(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request.post(`${baseUrl}/eia-development-description/change`).send({
				eiaDevelopmentDescription: 'agriculture-aquaculture'
			});

			expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}`
			);
		});
	});
});
