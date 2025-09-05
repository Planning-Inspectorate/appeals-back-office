import {
	appealData,
	lpaQuestionnaireDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
const lpaQuestionnaireUrl = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`;

describe('has-protected-species', () => {
	beforeEach(installMockApi), afterEach(teardown);

	describe('GET /change', () => {
		it('should render the hasProtectedSpecies change page when accessed from LPAQ page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);
			const response = await request.get(`${lpaQuestionnaireUrl}/has-protected-species/change`);

			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain('Would the development affect a protected species?</h1>');
		});

		it('should render a back link to LPAQ page on the hasProtectedSpecies change page when accessed from LPAQ page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);
			const response = await request.get(`${lpaQuestionnaireUrl}/has-protected-species/change`);

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);

			expect(backLinkInnerHtml).toContain(`href="${lpaQuestionnaireUrl}`);
		});
	});

	describe('POST /change', () => {
		it('should re-direct to LPA questionnaire if "yes" when accessed from LPAQ page', async () => {
			const validData = {
				protectedSpeciesRadio: 'yes'
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(`${lpaQuestionnaireUrl}/has-protected-species/change`)
				.send(validData);

			expect(apiCall.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});

		it('should re-direct to LPA questionnaire if "no" when accessed from LPAQ page', async () => {
			const validData = {
				protectedSpeciesRadio: 'no'
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(`${lpaQuestionnaireUrl}/has-protected-species/change`)
				.send(validData);

			expect(apiCall.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});
	});
});
