// @ts-nocheck
import {
	appealDataFullPlanning,
	lpaQuestionnaireDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('neighbouring-site-access', () => {
	describe('LPA questionnaire page', () => {
		describe('neighbouring-site-access', () => {
			const testCases = [
				{ value: null, expectedContent: ['No'] },
				{
					value: 'test neighbouring site access details text',
					expectedContent: ['Yes', 'test neighbouring site access details text']
				}
			];

			for (const testCase of testCases) {
				it(`should render a row for "Will the inspector need to enter a neighbour’s land or property?" with a value of "${testCase.expectedContent.join(
					', '
				)}" if reasonForNeighbourVisits is "${testCase.value}"`, async () => {
					nock('http://test/').get('/appeals/1?include=all').reply(200, appealDataFullPlanning);
					nock('http://test/')
						.get('/appeals/1/lpa-questionnaires/2')
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							reasonForNeighbourVisits: testCase.value
						});

					const response = await request.get(`${baseUrl}/1/lpa-questionnaire/2`);

					const rowKeyElement = parseHtml(response.text, {
						rootElement: '.lpa-neighbouring-site-access .govuk-summary-list__key',
						skipPrettyPrint: true
					});
					expect(rowKeyElement.innerHTML).toContain(
						'Will the inspector need to enter a neighbour’s land or property?'
					);

					const rowValueElement = parseHtml(response.text, {
						rootElement: '.lpa-neighbouring-site-access .govuk-summary-list__value',
						skipPrettyPrint: true
					});

					for (const expectedContentItem of testCase.expectedContent) {
						expect(rowValueElement.innerHTML).toContain(expectedContentItem);
					}
				});
			}

			it('should render a row for "Will the inspector need to enter a neighbour’s land or property?" with the value wrapped in a "show more" component, if reasonForNeighbourVisits is more than 300 characters in length', async () => {
				nock('http://test/').get('/appeals/1?include=all').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get('/appeals/1/lpa-questionnaires/2')
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						reasonForNeighbourVisits: 'a'.repeat(301)
					});

				const response = await request.get(`${baseUrl}/1/lpa-questionnaire/2`);

				const rowValueElement = parseHtml(response.text, {
					rootElement: '.lpa-neighbouring-site-access .govuk-summary-list__value',
					skipPrettyPrint: true
				});
				expect(rowValueElement.innerHTML).toContain('pins-show-more');
			});
		});
	});

	describe('change page', () => {
		beforeEach(installMockApi);
		afterEach(teardown);

		describe('GET /neighbouring-site-access/change', () => {
			it('should render the change neighbouring site access page with "No" radio option checked, and no text populated in the textarea, if reasonForNeighbourVisits is null', async () => {
				nock('http://test/').get('/appeals/1?include=all').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						reasonForNeighbourVisits: null
					});

				const response = await request.get(
					`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/neighbouring-site-access/change`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Will the inspector need to enter a neighbour’s land or property?</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="neighbouringSiteAccessRadio" type="radio" value="yes"'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="neighbouringSiteAccessRadio" type="radio" value="no" checked'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<textarea class="govuk-textarea" id="neighbouring-site-access-details" name="neighbouringSiteAccess" rows="3"></textarea>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});

			it('should render the change neighbouring site access page with "Yes" radio option checked, and "test neighbouring site access details" populated in the textarea, if reasonForNeighbourVisits is "test neighbouring site access details"', async () => {
				nock('http://test/').get('/appeals/1?include=all').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						reasonForNeighbourVisits: 'test neighbouring site access details'
					});

				const response = await request.get(
					`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/neighbouring-site-access/change`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Will the inspector need to enter a neighbour’s land or property?</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="neighbouringSiteAccessRadio" type="radio" value="yes" checked'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="neighbouringSiteAccessRadio" type="radio" value="no"'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<textarea class="govuk-textarea" id="neighbouring-site-access-details" name="neighbouringSiteAccess" rows="3">test neighbouring site access details</textarea>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /neighbouring-site-access/change', () => {
			it('should re-render the change neighbouring site access page with the expected validation error and the "yes" radio option checked, if "yes" was selected but no text was entered in the details textarea', async () => {
				nock('http://test/').get('/appeals/1?include=all').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						reasonForNeighbourVisits: null
					});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/neighbouring-site-access/change`
					)
					.send({
						neighbouringSiteAccessRadio: 'yes',
						neighbouringSiteAccess: ''
					});

				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(elementInnerHtml).toContain(
					'Will the inspector need to enter a neighbour’s land or property?</h1>'
				);
				expect(elementInnerHtml).toContain(
					'name="neighbouringSiteAccessRadio" type="radio" value="yes" checked'
				);
				expect(elementInnerHtml).toContain(
					'name="neighbouringSiteAccessRadio" type="radio" value="no"'
				);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain('Enter the reason</a>');
			});

			it('should re-render the change neighbouring site access page with the expected validation error, and the "yes" radio option checked, and the details textarea pre-populated with the submitted text, if "yes" was selected and the text entered in the details textarea exceeds 1000 characters in length', async () => {
				nock('http://test/').get('/appeals/1?include=all').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						reasonForNeighbourVisits: null
					});

				const submittedText = 'a'.repeat(1001);

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/neighbouring-site-access/change`
					)
					.send({
						neighbouringSiteAccessRadio: 'yes',
						neighbouringSiteAccess: submittedText
					});

				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(elementInnerHtml).toContain(
					'Will the inspector need to enter a neighbour’s land or property?</h1>'
				);
				expect(elementInnerHtml).toContain(
					'name="neighbouringSiteAccessRadio" type="radio" value="yes" checked'
				);
				expect(elementInnerHtml).toContain(
					'name="neighbouringSiteAccessRadio" type="radio" value="no"'
				);
				expect(elementInnerHtml).toContain(`${submittedText}</textarea>`);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'>Reason must be 1000 characters or less</a>'
				);
			});

			it('should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "no" was selected', async () => {
				const mockLPAQPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/neighbouring-site-access/change`
					)
					.send({
						neighbouringSiteAccessRadio: 'no',
						neighbouringSiteAccess: ''
					});

				expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
				);
			});

			it('should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "yes" was selected, and the text entered in the details textarea is between 1 and 1000 characters in length', async () => {
				const mockLPAQPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/neighbouring-site-access/change`
					)
					.send({
						neighbouringSiteAccessRadio: 'yes',
						neighbouringSiteAccess: 'a'.repeat(1000)
					});

				expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
				);
			});
		});
	});
});
