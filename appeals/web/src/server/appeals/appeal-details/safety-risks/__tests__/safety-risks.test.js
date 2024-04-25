import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('safety-risks', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change/:source', () => {
		it('should render changeSafetyRisksAccess page for the LPA answer when source is LPA from appeals details', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/safety-risks/change/lpa`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the site health and safety risks (LPA answer)');
		});

		it('should render changeSafetyRisksAccess page for the appellant answer when source is appellant from appeals details', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/safety-risks/change/appellant`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'Change the site health and safety risks (appellant answer)'
			);
		});

		it('should render changeSafetyRisksAccess page for the LPA answer when source is LPA from LPA questionnaire', async () => {
			const appealId = appealData.appealId;
			const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/safety-risks/change/lpa`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the site health and safety risks (LPA answer)');
		});

		it('should render changeSafetyRisksAccess page for the appellant answer when source is appellant from appellant case', async () => {
			const appealId = appealData.appealId;

			const response = await request.get(
				`${baseUrl}/${appealId}/appellant-case/safety-risks/change/appellant`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'Change the site health and safety risks (appellant answer)'
			);
		});
	});

	describe('POST /change/:source', () => {
		it('should re-render changeSafetyRisksAccess page with an error when isRequired is "yes" but details is empty', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				safetyRisksRadio: 'yes',
				safetyRisksDetails: ''
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/safety-risks/change/lpa`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Provide details of health and safety risks');
			expect(elementInnerHtml).toContain('govuk-error-summary');
		});

		it('should re-direct to appeals-details page when data is valid for LPA and came from appeal-details', async () => {
			const appealId = appealData.appealId;
			const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
			const validData = {
				safetyRisksRadio: 'yes',
				safetyRisksDetails: 'Details'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...validData
				});

			const response = await request
				.post(`${baseUrl}/${appealId}/safety-risks/change/lpa`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should re-direct to appeals-details page when data is valid for appellant and came from appeal-details', async () => {
			const appealId = appealData.appealId;
			const appellantCaseId = appealData.appellantCaseId;
			const validData = {
				safetyRisksRadio: 'yes',
				safetyRisksDetails: 'Details'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {
					...validData
				});

			const response = await request
				.post(`${baseUrl}/${appealId}/safety-risks/change/appellant`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should re-direct to appellant case page when data is valid for appellant and came from appellant-case', async () => {
			const appealId = appealData.appealId;
			const appellantCaseId = appealData.appellantCaseId;
			const validData = {
				safetyRisksRadio: 'yes',
				safetyRisksDetails: 'Details'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {
					...validData
				});

			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/safety-risks/change/appellant`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});

		it('should re-direct to lpaq page when data is valid for LPA and came from lpa-questionnaire', async () => {
			const appealId = appealData.appealId;
			const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
			const validData = {
				safetyRisksRadio: 'yes',
				safetyRisksDetails: 'Details'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...validData
				});

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/safety-risks/change/lpa`
				)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});
	});
});
