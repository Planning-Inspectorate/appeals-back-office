// @ts-nocheck
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
const baseUrl = '/appeals-service/appeal-details';

describe('is-infrastructure-levy-formally-adopted', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /is-infrastructure-levy-formally-adopted/change', () => {
		it('should render the change levy formally adopted page with "Formally adopted" radio option checked if isInfrastructureLevyFormallyAdopted is true', async () => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					isInfrastructureLevyFormallyAdopted: true
				});

			const response = await request.get(
				`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/is-infrastructure-levy-formally-adopted/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Is the community infrastructure levy formally adopted?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="isInfrastructureLevyFormallyAdoptedRadio" type="radio" value="yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="is-infrastructure-levy-formally-adopted-radio"> Yes</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="isInfrastructureLevyFormallyAdoptedRadio" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="is-infrastructure-levy-formally-adopted-radio-2"> No</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change levy formally adopted page with "Not formally adopted" radio option checked if isInfrastructureLevyFormallyAdopted is false', async () => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					isInfrastructureLevyFormallyAdopted: false
				});

			const response = await request.get(
				`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/is-infrastructure-levy-formally-adopted/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Is the community infrastructure levy formally adopted?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="isInfrastructureLevyFormallyAdoptedRadio" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="is-infrastructure-levy-formally-adopted-radio"> Yes</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="isInfrastructureLevyFormallyAdoptedRadio" type="radio" value="no" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="is-infrastructure-levy-formally-adopted-radio-2"> No</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /is-infrastructure-levy-formally-adopted/change', () => {
		it('should re-render the change levy formally adopted page with a validation error if a radio option was not selected', async () => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);

			const mockLPAQPatchEndpoint = nock('http://test/')
				.patch(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(
					`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/is-infrastructure-levy-formally-adopted/change`
				)
				.send({});

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Is the community infrastructure levy formally adopted?</h1>'
			);

			const errorSummaryElement = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: '.govuk-error-summary'
			});

			expect(errorSummaryElement.innerHTML).toMatchSnapshot();
			expect(errorSummaryElement.innerHTML).toContain('Select whether levy formally adopted</a>');
			expect(mockLPAQPatchEndpoint.isDone()).toBe(false);
		});

		const validValues = ['yes', 'no'];

		for (const validValue of validValues) {
			it(`should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "${validValue}" is selected`, async () => {
				const mockLPAQPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/is-infrastructure-levy-formally-adopted/change`
					)
					.send({
						isInfrastructureLevyFormallyAdoptedRadio: validValue
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
