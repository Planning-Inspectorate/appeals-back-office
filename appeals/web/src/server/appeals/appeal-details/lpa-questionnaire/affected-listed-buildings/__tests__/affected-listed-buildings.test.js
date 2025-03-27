import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData, lpaQuestionnaireData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealId = appealData.appealId;
const lpaQuestionnaireId = appealData.lpaQuestionnaireId;

describe('affected-listed-buildings', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
			.reply(200, {
				...lpaQuestionnaireData
			});
	});
	afterEach(teardown);

	describe('GET /add', () => {
		it('should render the add affected listed building page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/add`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Add affected listed building</h1>');
		});
	});

	describe('POST /add', () => {
		it('should re-render the add affected listed building page with an error when listed building is empty', async () => {
			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/add`
				)
				.send({});
			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Add affected listed building</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Provide a listed building entry list number</a>');
		});

		it('should redirect to the check-and-confirm page when data is valid', async () => {
			const validData = {
				affectedListedBuilding: '12345'
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/add`
				)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1/affected-listed-buildings/add/check-and-confirm'
			);
		});
	});

	describe('GET /add/check-and-confirm', () => {
		it('should render the add affected listed building check and confirm page', async () => {
			const validData = {
				affectedListedBuilding: '12345'
			};

			await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/add`
				)
				.send(validData);

			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/add/check-and-confirm`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Check your answer</h1>');
			expect(elementInnerHtml).toContain('Confirm</button>');

			const summaryListHtml = parseHtml(response.text, {
				rootElement: '.govuk-summary-list',
				skipPrettyPrint: true
			}).innerHTML;
			expect(summaryListHtml).toContain('Listed building number</dt>');
			expect(summaryListHtml).toContain(
				'<a href="https://historicengland.org.uk/listing/the-list/list-entry/12345" class="govuk-link" target="_blank">12345</a>'
			);
		});
	});

	describe('POST /add/check-and-confirm', () => {
		it('should redirect to the lpa questionnaire page', async () => {
			const validData = {
				affectedListedBuilding: '12345'
			};
			nock('http://test/').post(`/appeals/${appealId}/listed-buildings`).reply(200, {});

			await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/add`
				)
				.send(validData);

			const response = await request.post(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/add/check-and-confirm`
			);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});
	});

	describe('GET /manage', () => {
		it('should render the manage affected listed buildings page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/manage`
			);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toContain('Add affected listed buildings</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(unprettifiedElement).toContain('Listed buildings</caption>');
			expect(unprettifiedElement).toContain('Listed building</th>');
			expect(unprettifiedElement).toContain('Action</th>');
			expect(unprettifiedElement).toContain(
				'Change<span class="govuk-visually-hidden"> listed building 123456</span></a>'
			);
			expect(unprettifiedElement).toContain(
				'Remove<span class="govuk-visually-hidden"> listed building 123456</span></a>'
			);
		});
	});

	describe('GET /change/:listedBuildingId', () => {
		it('should render the change listed building page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/change/1`
			);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toContain('Change affected listed building</h1>');
		});
	});

	describe('POST /change/:listedBuildingId', () => {
		it('should re-render the change listed building page when the data is invalid', async () => {
			const invalidData = {
				affectedListedBuilding: null
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/change/1`
				)
				.send(invalidData);

			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change affected listed building</h1>');
		});

		it('should redirect to to the check and confirm page if the data is valid', async () => {
			const validData = {
				affectedListedBuilding: '12345'
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/change/1`
				)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1/affected-listed-buildings/change/1/check-and-confirm'
			);
		});
	});

	describe('GET /change/:listedBuildingId/check-and-confirm', () => {
		it('should render the check and confirm page', async () => {
			const validData = {
				affectedListedBuilding: '12345'
			};
			await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/change/1`
				)
				.send(validData);
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/change/1/check-and-confirm`
			);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('Check your answer</h1>');
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(unprettifiedElement).toContain('Listed building</dt>');
			expect(unprettifiedElement).toContain(
				'<a href="https://historicengland.org.uk/listing/the-list/list-entry/12345" class="govuk-link" target="_blank">12345</a>'
			);
		});
	});

	describe('POST /change/:listedBuildingId/check-and-confirm', () => {
		it('should redirect to lpa questionnaire', async () => {
			const validData = {
				affectedListedBuilding: '12345'
			};

			nock('http://test/').patch(`/appeals/${appealId}/listed-buildings/1`).reply(200, {});

			await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/change/1`
				)
				.send(validData);
			const response = await request.post(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/change/1/check-and-confirm`
			);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1'
			);
		});
	});

	describe('GET /remove/:listedBuildingId', () => {
		it('should render the remove affected listed building page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/remove/1`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(response.statusCode).toBe(200);
			expect(elementInnerHtml).toContain('Remove affected listed building</h1>');
		});
	});

	describe('POST /remove/:listedBuildingId', () => {
		it('should redirect to manage listed building if the answer is no', async () => {
			const validData = {
				removeAffectedListedBuilding: 'no'
			};
			nock('http://test/').delete(`/appeals/${appealId}/listed-buildings`).reply(200, {});
			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/remove/1`
				)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1/affected-listed-buildings/manage`
			);
		});

		it('should redirect to manage listed building if the answer is yes', async () => {
			const validData = {
				removeAffectedListedBuilding: 'yes'
			};
			nock('http://test/').delete(`/appeals/${appealId}/listed-buildings`).reply(200, {});
			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/remove/1`
				)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1`
			);
		});
	});
});
