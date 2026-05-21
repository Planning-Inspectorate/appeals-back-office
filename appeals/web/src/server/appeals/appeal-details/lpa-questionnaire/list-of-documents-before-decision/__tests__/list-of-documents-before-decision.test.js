// @ts-nocheck
import {
	appealDataFullPlanning,
	lpaQuestionnaireDataExpeditedNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('list-of-documents-before-decision', () => {
	beforeAll(teardown);
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2
			})
			.persist();
	});
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the change list of documents before decision page with "listDocumentsBeforeDecisionTextarea" textarea unpopulated if listOfDocumentsBeforeDecision is not populated in the LPA questionnaire data', async () => {
			nock('http://test/')
				.get(
					`/appeals/${appealDataFullPlanning.appealId}/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`
				)
				.reply(200, lpaQuestionnaireDataExpeditedNotValidated);

			const response = await request.get(
				`${baseUrl}/${appealDataFullPlanning.appealId}/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/list-of-documents-before-decision/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'What documents and plans did you use to make your decision?</label></h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="list-documents-before-decision" name="listDocumentsBeforeDecisionTextarea" rows="5">Blah blah</textarea>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		const testText1000Characters = 'a'.repeat(1000);
		const testText1001Characters = 'a'.repeat(8001);

		it('should re-render the change list of documents before decision page with the expected error message if "listDocumentsBeforeDecisionTextarea" textarea contains more than 8000 characters', async () => {
			nock('http://test/')
				.get(
					`/appeals/${appealDataFullPlanning.appealId}/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`
				)
				.reply(200, lpaQuestionnaireDataExpeditedNotValidated);

			const response = await request
				.post(
					`${baseUrl}/${appealDataFullPlanning.appealId}/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/list-of-documents-before-decision/change`
				)
				.send({
					listDocumentsBeforeDecisionTextarea: testText1001Characters
				});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Text must contain 8000 characters or less</a>'
			);
		});

		it(`should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "listDocumentsBeforeDecisionTextarea" textarea is populated with a valid value'
		}`, async () => {
			const mockPatchEndpoint = nock('http://test/')
				.patch(
					`/appeals/${appealDataFullPlanning.appealId}/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`
				)
				.reply(200, {});

			const response = await request
				.post(
					`${baseUrl}/${appealDataFullPlanning.appealId}/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/list-of-documents-before-decision/change`
				)
				.send({
					listDocumentsBeforeDecisionTextarea: testText1000Characters
				});

			expect(mockPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealDataFullPlanning.appealId}/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
			);
		});
	});
});
