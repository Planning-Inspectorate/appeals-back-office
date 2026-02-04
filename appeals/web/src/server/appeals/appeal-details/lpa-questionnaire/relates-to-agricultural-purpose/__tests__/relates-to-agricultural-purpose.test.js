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

describe('relates-to-agricultural-purpose', () => {
	(beforeEach(installMockApi), afterEach(teardown));

	describe('GET /change', () => {
		it('should render the relatesToAgriculturalPurpose change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireData);
			const response = await request.get(`${baseUrl}/agricultural-purpose/change`);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'Is the building on agricultural land and will it be used for agricultural purposes?</h1>'
			);
		});
	});

	describe('POST /change', () => {
		it('should re-direct to LPA questionnaire if "yes"', async () => {
			const validData = {
				relatesToAgriculturalPurposeRadio: 'yes'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request.post(`${baseUrl}/agricultural-purpose/change`).send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});

		it('should re-direct to LPA questionnaire if "no"', async () => {
			const validData = {
				relatesToAgriculturalPurposeRadio: 'no'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request.post(`${baseUrl}/agricultural-purpose/change`).send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});
	});
});
