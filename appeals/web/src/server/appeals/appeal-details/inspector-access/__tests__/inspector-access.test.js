import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('inspector-access', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change/:source', () => {
		it('should render changeInspectorAccess page for the lpa answer when source is lpa from appeals details', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/inspector-access/change/lpa`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the inspector access (LPA answer)</h1>');
		});

		it('should render changeInspectorAccess page for the appellant answer when source is appellant from appeals details', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(
				`${baseUrl}/${appealId}/inspector-access/change/appellant`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the inspector access (appellant answer)</h1>');
		});

		it('should render changeInspectorAccess page for the lpa answer when source is lpa from lpa questionnaire', async () => {
			const appealId = appealData.appealId;
			const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/inspector-access/change/lpa`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the inspector access (LPA answer)</h1>');
		});

		it('should render changeInspectorAccess page for the appellant answer when source is appellant from appellant case', async () => {
			const appealId = appealData.appealId;

			const response = await request.get(
				`${baseUrl}/${appealId}/appellant-case/inspector-access/change/appellant`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the inspector access (appellant answer)</h1>');
		});
	});

	describe('POST /change/:source', () => {
		it('should re-render changeInspectorAccess page with an error when isRequired is "yes" but details is empty', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				inspectorAccessRadio: 'yes',
				inspectorAccessDetails: ''
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/inspector-access/change/lpa`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change the inspector access (LPA answer)</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Provide details when inspector access is required</a>'
			);
		});

		it('should re-direct to appeals-details page when data is valid for lpa and came from appeal-details', async () => {
			const appealId = appealData.appealId;
			const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
			const validData = {
				inspectorAccessRadio: 'yes',
				inspectorAccessDetails: 'Details'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...validData
				});

			const response = await request
				.post(`${baseUrl}/${appealId}/inspector-access/change/lpa`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should re-direct to appeals-details page when data is valid for appellant and came from appeal-details', async () => {
			const appealId = appealData.appealId;
			const appellantCaseId = appealData.appellantCaseId;
			const validData = {
				inspectorAccessRadio: 'yes',
				inspectorAccessDetails: 'Details'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {
					...validData
				});

			const response = await request
				.post(`${baseUrl}/${appealId}/inspector-access/change/appellant`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should re-direct to appellant case page when data is valid for appellant and came from appellant-case', async () => {
			const appealId = appealData.appealId;
			const appellantCaseId = appealData.appellantCaseId;
			const validData = {
				inspectorAccessRadio: 'yes',
				inspectorAccessDetails: 'Details'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, {
					...validData
				});

			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/inspector-access/change/appellant`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});

		it('should re-direct to lpaq page when data is valid for lpa and came from lpa-questionnaire', async () => {
			const appealId = appealData.appealId;
			const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
			const validData = {
				inspectorAccessRadio: 'yes',
				inspectorAccessDetails: 'Details'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...validData
				});

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/inspector-access/change/lpa`
				)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});
	});
});
