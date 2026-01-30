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

describe('trunk-road', () => {
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
		it('should render the change trunk road page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/trunk-road/change`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'Is the appeal site within 67 metres of a trunk road?</h1>'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="trunkRoadRadio" type="radio" value="yes"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="trunk-road-details" name="trunkRoadDetails" rows="3">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="trunkRoadRadio" type="radio" value="no"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	it('should re-render the change trunk road page with an error when details exceeds 8000 characters', async () => {
		const appealId = appealData.appealId.toString();
		const invalidData = {
			trunkRoadRadio: 'yes',
			trunkRoadDetails: 'a'.repeat(8001) // Creates string of 8001 'a' characters
		};

		const response = await request
			.post(`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/trunk-road/change`)
			.send(invalidData);

		expect(response.statusCode).toBe(200);

		const elementInnerHtml = parseHtml(response.text).innerHTML;
		const errorSummaryHtml = parseHtml(response.text, {
			rootElement: '.govuk-error-summary',
			skipPrettyPrint: true
		}).innerHTML;

		expect(elementInnerHtml).toMatchSnapshot();
		expect(errorSummaryHtml).toContain('There is a problem</h2>');
		expect(errorSummaryHtml).toContain('Trunk road name must be 8000 characters or less</a>');
	});

	describe('POST /change', () => {
		it('should re-render the change trunk road page with an error when isRequired is "yes" but details is empty', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				trunkRoadRadio: 'yes',
				trunkRoadDetails: ''
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/trunk-road/change`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(
				'Is the appeal site within 67 metres of a trunk road?</h1>'
			);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter trunk road name</a>');
		});

		it('should re-direct to the LPA questionnaire page when data is valid', async () => {
			const validData = {
				trunkRoadRadio: 'yes',
				trunkRoadDetails: 'Details'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...validData
				});

			const response = await request
				.post(`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/trunk-road/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1'
			);
		});
	});
});
