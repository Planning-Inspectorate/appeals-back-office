import {
	appealData,
	appellantCaseDataIncompleteOutcome,
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
const appellantCaseId = appealData.appellantCaseId;
const lpaQuestionnaireUrl = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`;
const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

describe('green-belt', () => {
	beforeEach(installMockApi), afterEach(teardown);

	describe('GET /change', () => {
		it('should render the greenBelt change page when accessed from LPAQ page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);
			const response = await request.get(`${lpaQuestionnaireUrl}/green-belt/change/lpa`);

			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain('Is the appeal site in a green belt?</h1>');
		});

		it('should render a back link to LPAQ page on the greenBelt change page when accessed from LPAQ page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);
			const response = await request.get(`${lpaQuestionnaireUrl}/green-belt/change/lpa`);

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);

			expect(backLinkInnerHtml).toContain(`href="${lpaQuestionnaireUrl}`);
		});

		it('should render the greenBelt change page when accessed from Appellant Case page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataIncompleteOutcome);
			const response = await request.get(`${appellantCaseUrl}/green-belt/change/appellant`);

			const mainInnerHtml = parseHtml(response.text).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain('Is the appeal site in a green belt?</h1>');
		});

		it('should render a back link to appellant case page on the greenBelt change page when accessed from Appellant Case page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataIncompleteOutcome);
			const response = await request.get(`${appellantCaseUrl}/green-belt/change/appellant`);

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(backLinkInnerHtml).toContain(`href="${appellantCaseUrl}`);
		});
	});

	describe('POST /change', () => {
		it('should re-direct to LPA questionnaire if "yes" when accessed from LPAQ page', async () => {
			const validData = {
				greenBeltRadio: 'yes'
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(`${lpaQuestionnaireUrl}/green-belt/change/lpa`)
				.send(validData);

			expect(apiCall.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});

		it('should re-direct to LPA questionnaire if "no" when accessed from LPAQ page', async () => {
			const validData = {
				greenBeltRadio: 'no'
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(`${lpaQuestionnaireUrl}/green-belt/change/lpa`)
				.send(validData);

			expect(apiCall.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});

		it('should re-direct to Appellant Case if "yes" when accessed from Appellant Case page', async () => {
			const validData = {
				greenBeltRadio: 'yes'
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {});

			const response = await request
				.post(`${appellantCaseUrl}/green-belt/change/appellant`)
				.send(validData);

			expect(apiCall.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});

		it('should re-direct to Appellant Case if "no" when accessed from Appellant Case page', async () => {
			const validData = {
				greenBeltRadio: 'no'
			};

			const apiCall = nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {});

			const response = await request
				.post(`${appellantCaseUrl}/green-belt/change/appellant`)
				.send(validData);

			expect(apiCall.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
			);
		});
	});
});
