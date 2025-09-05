import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

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
			expect(elementInnerHtml).toContain('Are there any potential safety risks?</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="safetyRisksRadio" type="radio" value="yes"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="safety-risks-details" name="safetyRisksDetails" rows="3">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="safetyRisksRadio" type="radio" value="no"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render changeSafetyRisksAccess page for the appellant answer when source is appellant from appeals details', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/safety-risks/change/appellant`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'Are there any health and safety issues on the appeal site?</h1>'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="safetyRisksRadio" type="radio" value="yes"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="safety-risks-details" name="safetyRisksDetails" rows="3">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="safetyRisksRadio" type="radio" value="no"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render changeSafetyRisksAccess page for the LPA answer when source is LPA from LPA questionnaire', async () => {
			const appealId = appealData.appealId;
			const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/safety-risks/change/lpa`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Are there any potential safety risks?</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="safetyRisksRadio" type="radio" value="yes"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="safety-risks-details" name="safetyRisksDetails" rows="3">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="safetyRisksRadio" type="radio" value="no"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render changeSafetyRisksAccess page for the appellant answer when source is appellant from appellant case', async () => {
			const appealId = appealData.appealId;

			const response = await request.get(
				`${baseUrl}/${appealId}/appellant-case/safety-risks/change/appellant`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'Are there any health and safety issues on the appeal site?</h1>'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="safetyRisksRadio" type="radio" value="yes"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="safety-risks-details" name="safetyRisksDetails" rows="3">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="safetyRisksRadio" type="radio" value="no"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
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
			expect(elementInnerHtml).toContain('Are there any potential safety risks?</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter health and safety risks</a>');
		});

		it('should re-render changeSafetyRisksAccess page with an error when safetyRisksDetails exceeds 1000 characters', async () => {
			const appealId = appealData.appealId.toString();
			const invalidData = {
				safetyRisksRadio: 'yes',
				safetyRisksDetails: 'a'.repeat(1001) // Creates string of 1001 'a' characters
			};

			const response = await request
				.post(`${baseUrl}/${appealId}/safety-risks/change/lpa`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Health and safety risks must be 1000 characters or less</a>'
			);
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
