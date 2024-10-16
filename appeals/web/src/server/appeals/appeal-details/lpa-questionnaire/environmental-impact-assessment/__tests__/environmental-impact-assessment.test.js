// @ts-nocheck
import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import {
	appealData,
	lpaQuestionnaireDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('environmental-impact-assessment', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /environmental-impact-assessment/column-two-threshold/change', () => {
		it('should render the change eia column two threshold page with "Meets or exceeds" radio option checked if eiaColumnTwoThreshold is true', async () => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					eiaColumnTwoThreshold: true
				});

			const response = await request.get(
				`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/environmental-impact-assessment/column-two-threshold/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Change whether meets or exceeds column 2 threshold criteria</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaColumnTwoThreshold" type="radio" value="yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="eiaColumnTwoThreshold"> Meets or exceeds</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaColumnTwoThreshold" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="eiaColumnTwoThreshold-2"> Does not meet or exceed</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change eia column two threshold page with "Does not meet or exceed" radio option checked if eiaColumnTwoThreshold is false', async () => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					eiaColumnTwoThreshold: false
				});

			const response = await request.get(
				`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/environmental-impact-assessment/column-two-threshold/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Change whether meets or exceeds column 2 threshold criteria</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaColumnTwoThreshold" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="eiaColumnTwoThreshold"> Meets or exceeds</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaColumnTwoThreshold" type="radio" value="no" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="eiaColumnTwoThreshold-2"> Does not meet or exceed</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /environmental-impact-assessment/column-two-threshold/change', () => {
		const validValues = ['yes', 'no'];

		for (const validValue of validValues) {
			it(`should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "${validValue}" is selected`, async () => {
				const mockLPAQPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/environmental-impact-assessment/column-two-threshold/change`
					)
					.send({
						eiaColumnTwoThreshold: validValue
					});

				expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}`
				);
			});
		}
	});

	describe('GET /environmental-impact-assessment/requires-environmental-statement/change', () => {
		it('should render the change eia requires environmental statement page with "Needed" radio option checked if eiaRequiresEnvironmentalStatement is true', async () => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					eiaRequiresEnvironmentalStatement: true
				});

			const response = await request.get(
				`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/environmental-impact-assessment/requires-environmental-statement/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Change opinion that environmental statement needed</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaRequiresEnvironmentalStatement" type="radio" value="yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="eiaRequiresEnvironmentalStatement"> Needed</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaRequiresEnvironmentalStatement" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="eiaRequiresEnvironmentalStatement-2"> Not needed</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change eia requires environmental statement page with "Not needed" radio option checked if eiaRequiresEnvironmentalStatement is false', async () => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					eiaRequiresEnvironmentalStatement: false
				});

			const response = await request.get(
				`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/environmental-impact-assessment/requires-environmental-statement/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Change opinion that environmental statement needed</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaRequiresEnvironmentalStatement" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="eiaRequiresEnvironmentalStatement"> Needed</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="eiaRequiresEnvironmentalStatement" type="radio" value="no" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="eiaRequiresEnvironmentalStatement-2"> Not needed</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /environmental-impact-assessment/requires-environmental-statement/change', () => {
		const validValues = ['yes', 'no'];

		for (const validValue of validValues) {
			it(`should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "${validValue}" is selected`, async () => {
				const mockLPAQPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/environmental-impact-assessment/requires-environmental-statement/change`
					)
					.send({
						eiaRequiresEnvironmentalStatement: validValue
					});

				expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}`
				);
			});
		}
	});
});
