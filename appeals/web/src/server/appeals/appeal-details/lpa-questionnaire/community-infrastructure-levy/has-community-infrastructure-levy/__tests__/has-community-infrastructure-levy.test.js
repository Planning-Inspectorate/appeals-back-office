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

describe('has-community-infrastructure-levy', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /has-community-infrastructure-levy/change', () => {
		it('should render the change community infrastructure levy status page with "Yes" radio option checked if hasInfrastructureLevy is true', async () => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					hasInfrastructureLevy: true
				});

			const response = await request.get(
				`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/has-community-infrastructure-levy/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Do you have a community infrastructure levy?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="hasCommunityInfrastructureLevyRadio" type="radio" value="yes" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="has-community-infrastructure-levy-radio"> Yes</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="hasCommunityInfrastructureLevyRadio" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="has-community-infrastructure-levy-radio-2"> No</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change community infrastructure levy status page with "Does not have infrastructure levy" radio option checked if hasInfrastructureLevy is false', async () => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					hasInfrastructureLevy: false
				});

			const response = await request.get(
				`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/has-community-infrastructure-levy/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Do you have a community infrastructure levy?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="hasCommunityInfrastructureLevyRadio" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="has-community-infrastructure-levy-radio"> Yes</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="hasCommunityInfrastructureLevyRadio" type="radio" value="no" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="has-community-infrastructure-levy-radio-2"> No</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /has-community-infrastructure-levy/change', () => {
		it('should re-render the change community infrastructure levy status page with a validation error if a radio option was not selected', async () => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);

			const mockLPAQPatchEndpoint = nock('http://test/')
				.patch(`/appeals/1/lpa-questionnaires/${appealData.lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(
					`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/has-community-infrastructure-levy/change`
				)
				.send({});

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Do you have a community infrastructure levy?</h1>'
			);

			const errorSummaryElement = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: '.govuk-error-summary'
			});

			expect(errorSummaryElement.innerHTML).toMatchSnapshot();
			expect(errorSummaryElement.innerHTML).toContain(
				'Select community infrastructure levy status</a>'
			);
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
						`${baseUrl}/1/lpa-questionnaire/${appealData.lpaQuestionnaireId}/has-community-infrastructure-levy/change`
					)
					.send({
						hasCommunityInfrastructureLevyRadio: validValue
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
