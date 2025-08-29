import { appealData, lpaQuestionnaireData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealId = appealData.appealId;
const lpaQuestionnaireId = appealData.lpaQuestionnaireId;

describe('extra-conditions', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
			.reply(200, {
				...lpaQuestionnaireData
			});
	});
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the change new conditions page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/extra-conditions/change`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Are there any new conditions?</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="extraConditionsRadio" type="radio" value="yes"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="extra-conditions-details" name="extraConditionsDetails" rows="3">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="extraConditionsRadio" type="radio" value="no"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	it('should re-render the change new conditions page with an error when details exceeds 8000 characters', async () => {
		const appealId = appealData.appealId.toString();
		const invalidData = {
			extraConditionsRadio: 'yes',
			extraConditionsDetails: 'a'.repeat(8001) // Creates string of 8001 'a' characters
		};

		const response = await request
			.post(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/extra-conditions/change`
			)
			.send(invalidData);

		expect(response.statusCode).toBe(200);

		const elementInnerHtml = parseHtml(response.text).innerHTML;
		const errorSummaryHtml = parseHtml(response.text, {
			rootElement: '.govuk-error-summary',
			skipPrettyPrint: true
		}).innerHTML;

		expect(elementInnerHtml).toMatchSnapshot();
		expect(errorSummaryHtml).toContain('There is a problem</h2>');
		expect(errorSummaryHtml).toContain('New conditions must be 8000 characters or less</a>');
	});

	describe('POST /change', () => {
		it('should re-render the change new conditions page with an error when isRequired is "yes" but details is empty', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				extraConditionsRadio: 'yes',
				extraConditionsDetails: ''
			};
			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/extra-conditions/change`
				)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Are there any new conditions?</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter new conditions details</a>');
		});

		it('should re-direct to the LPA questionnaire page when data is valid', async () => {
			const validData = {
				extraConditionsRadio: 'yes',
				extraConditionsDetails: 'Details'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...validData
				});

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/extra-conditions/change`
				)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1'
			);
		});
	});
});
