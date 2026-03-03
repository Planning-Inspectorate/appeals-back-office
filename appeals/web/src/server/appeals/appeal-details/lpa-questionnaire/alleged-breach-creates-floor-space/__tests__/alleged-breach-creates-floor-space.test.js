import { appealData, lpaQuestionnaireData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
const lpaQuestionnaireUrl = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`;

describe('alleged-breach-creates-floor-space', () => {
	(beforeEach(installMockApi), afterEach(teardown));

	describe('GET /change', () => {
		it('should render the allegedBreachCreatesFloorSpace change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireData);
			const response = await request.get(
				`${lpaQuestionnaireUrl}/alleged-breach-creates-floor-space/change`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Does the alleged breach create any floor space?</h1>');
		});
	});

	describe('POST /change', () => {
		it('should re-direct to LPA questionnaire if "yes"', async () => {
			const validData = {
				floorSpaceCreatedByBreachInSquareMetresRadio: 'yes',
				floorSpaceCreatedByBreachInSquareMetres: '20'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(`${lpaQuestionnaireUrl}/alleged-breach-creates-floor-space/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});

		it('should redirect back to the change page if no answer is given', async () => {
			const invalidData = {};
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireData);

			const response = await request
				.post(`${lpaQuestionnaireUrl}/alleged-breach-creates-floor-space/change`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'Select yes if the alleged breach creates any floor space</a>'
			);
		});

		it('should redirect back to the change page if invalid floor space value is provided', async () => {
			const invalidData = {
				floorSpaceCreatedByBreachInSquareMetresRadio: 'yes',
				floorSpaceCreatedByBreachInSquareMetres: 'sa'
			};
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireData);

			const response = await request
				.post(`${lpaQuestionnaireUrl}/alleged-breach-creates-floor-space/change`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Floor space must be a number or decimal</a>');
		});

		it('should re-direct to LPA questionnaire if "no"', async () => {
			const validData = {
				floorSpaceCreatedByBreachInSquareMetresRadio: 'no'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(`${lpaQuestionnaireUrl}/alleged-breach-creates-floor-space/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});
	});
});
