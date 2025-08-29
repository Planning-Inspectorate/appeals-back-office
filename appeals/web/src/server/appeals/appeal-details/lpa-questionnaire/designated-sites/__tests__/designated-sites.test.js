// @ts-nocheck
import {
	appealDataFullPlanning,
	designatedSiteNames,
	lpaDesignatedSites,
	lpaQuestionnaireDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('in-near-or-likely-to-affect-designated-sites', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get('/appeals/2')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2
			});
		nock('http://test/').get('/appeals/lpa-designated-sites').reply(200, lpaDesignatedSites);
	});
	afterEach(teardown);

	describe('GET /in-near-or-likely-to-affect-designated-sites/change', () => {
		it('should render the change in, near or likely to affect designated sites page with the expected content', async () => {
			nock('http://test/')
				.get('/appeals/2/lpa-questionnaires/1')
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					lpaQuestionnaireId: 1,
					designatedSiteNames: []
				});

			const response = await request.get(
				`${baseUrl}/2/lpa-questionnaire/1/in-near-or-likely-to-affect-designated-sites/change`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain(
				'Change whether the site is in, partly in, or likely to affect a sensitive area</h1>'
			);

			for (const lpaDesignatedSite of lpaDesignatedSites) {
				expect(unprettifiedHtml).toContain(
					`name="inNearOrLikelyToAffectDesignatedSitesCheckboxes" type="checkbox" value="${lpaDesignatedSite.key}">`
				);
				expect(unprettifiedHtml).toContain(`${lpaDesignatedSite.name}</label>`);
			}

			expect(unprettifiedHtml).toContain(
				'name="inNearOrLikelyToAffectDesignatedSitesCheckboxes" type="checkbox" value="other"'
			);
			expect(unprettifiedHtml).toContain(
				'for="inNearOrLikelyToAffectDesignatedSitesCheckboxes-6"> Other</label>'
			);
			expect(unprettifiedHtml).toContain(
				'for="custom-designation" class="govuk-label">Other designation(s)</label>'
			);
			expect(unprettifiedHtml).toContain(
				'id="custom-designation" name="customDesignation" type="text"'
			);
			expect(unprettifiedHtml).toContain('class="govuk-checkboxes__divider">or</div>');
			expect(unprettifiedHtml).toContain(
				'name="inNearOrLikelyToAffectDesignatedSitesCheckboxes" type="checkbox" value="none" checked data-behaviour="exclusive"'
			);
			expect(unprettifiedHtml).toContain(
				'for="inNearOrLikelyToAffectDesignatedSitesCheckboxes-8"> No, it is not in, near or likely to affect any designated sites</label>'
			);
			expect(unprettifiedHtml).toContain(
				'<button type="submit" data-prevent-double-click="true" class="govuk-button" data-module="govuk-button"> Continue</button>'
			);
		});

		it('should render the change in, near or likely to affect designated sites page with the expected checkboxes checked if there are existing designatedSiteNames items in the LPA questionnaire', async () => {
			nock('http://test/')
				.get('/appeals/2/lpa-questionnaires/1')
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					lpaQuestionnaireId: 1,
					designatedSiteNames
				});

			const response = await request.get(
				`${baseUrl}/2/lpa-questionnaire/1/in-near-or-likely-to-affect-designated-sites/change`
			);

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('type="checkbox" value="SSSI" checked>');
		});

		it('should render the change in, near or likely to affect designated sites page with the "Other" checkbox checked, and the corresponding custom designatedSite text populated in the conditional text input, if there is an existing custom designatedSiteNames item in the LPA questionnaire', async () => {
			nock('http://test/')
				.get('/appeals/2/lpa-questionnaires/1')
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					lpaQuestionnaireId: 1,
					designatedSiteNames
				});

			const response = await request.get(
				`${baseUrl}/2/lpa-questionnaire/1/in-near-or-likely-to-affect-designated-sites/change`
			);

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('type="checkbox" value="other" checked');
			expect(unprettifiedHtml).toContain(
				'id="custom-designation" name="customDesignation" type="text" value="test custom designation">'
			);
		});

		it('should render the change in, near or likely to affect designated sites page with the "None" checkbox checked if there are no existing designatedSiteNames items in the LPA questionnaire', async () => {
			nock('http://test/')
				.get('/appeals/2/lpa-questionnaires/1')
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					lpaQuestionnaireId: 1,
					designatedSiteNames: []
				});

			const response = await request.get(
				`${baseUrl}/2/lpa-questionnaire/1/in-near-or-likely-to-affect-designated-sites/change`
			);

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain(
				'type="checkbox" value="none" checked data-behaviour="exclusive">'
			);
		});
	});

	describe('POST /in-near-or-likely-to-affect-designated-sites/change', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/lpa-questionnaires/1')
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					lpaQuestionnaireId: 1,
					designatedSiteNames: []
				});
		});

		it('should call the PATCH LPA questionnaire endpoint with the expected payload and redirect to the LPA Questionnaire page if a single checkbox is checked', async () => {
			const mockedLPAQPatchEndpoint = nock('http://test/')
				.patch('/appeals/2/lpa-questionnaires/1')
				.reply(200, {});

			const response = await request
				.post(
					`${baseUrl}/2/lpa-questionnaire/1/in-near-or-likely-to-affect-designated-sites/change`
				)
				.send({
					inNearOrLikelyToAffectDesignatedSitesCheckboxes: 'SSSI',
					customDesignation: ''
				});

			expect(mockedLPAQPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/2/lpa-questionnaire/1'
			);
		});

		it('should call the PATCH LPA questionnaire endpoint with the expected payload and redirect to the LPA Questionnaire page if multiple checkboxes are checked', async () => {
			const mockedLPAQPatchEndpoint = nock('http://test/')
				.patch('/appeals/2/lpa-questionnaires/1')
				.reply(200, {});

			const response = await request
				.post(
					`${baseUrl}/2/lpa-questionnaire/1/in-near-or-likely-to-affect-designated-sites/change`
				)
				.send({
					inNearOrLikelyToAffectDesignatedSitesCheckboxes: ['SAC', 'SPA'],
					customDesignation: ''
				});

			expect(mockedLPAQPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/2/lpa-questionnaire/1'
			);
		});

		it('should re-render the change page with the expected error message and not call the PATCH LPA questionnaire endpoint if the "Other" checkbox is checked but custom designation text is not populated in the conditional text input', async () => {
			const mockedLPAQPatchEndpoint = nock('http://test/')
				.patch('/appeals/2/lpa-questionnaires/1')
				.reply(200, {});

			const response = await request
				.post(
					`${baseUrl}/2/lpa-questionnaire/1/in-near-or-likely-to-affect-designated-sites/change`
				)
				.send({
					inNearOrLikelyToAffectDesignatedSitesCheckboxes: 'other',
					customDesignation: ''
				});

			const unprettifiedHtml = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: '.govuk-error-summary'
			}).innerHTML;

			expect(mockedLPAQPatchEndpoint.isDone()).toBe(false);
			expect(response.statusCode).toBe(200);
			expect(unprettifiedHtml).toContain('There is a problem</h2>');
			expect(unprettifiedHtml).toContain('Enter details of the other designation(s)</a>');
		});

		it('should call the PATCH LPA questionnaire endpoint with the expected payload and redirect to the LPA Questionnaire page if the "Other" checkbox is checked and custom designation text is populated in the conditional text input', async () => {
			const mockedLPAQPatchEndpoint = nock('http://test/')
				.patch('/appeals/2/lpa-questionnaires/1')
				.reply(200, {});

			const response = await request
				.post(
					`${baseUrl}/2/lpa-questionnaire/1/in-near-or-likely-to-affect-designated-sites/change`
				)
				.send({
					inNearOrLikelyToAffectDesignatedSitesCheckboxes: 'other',
					customDesignation: 'test custom designation'
				});

			expect(mockedLPAQPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/2/lpa-questionnaire/1'
			);
		});

		it('should call the PATCH LPA questionnaire endpoint with the expected payload and redirect to the LPA Questionnaire page if the "None" checkbox is checked', async () => {
			const mockedLPAQPatchEndpoint = nock('http://test/')
				.patch('/appeals/2/lpa-questionnaires/1')
				.reply(200, {});

			const response = await request
				.post(
					`${baseUrl}/2/lpa-questionnaire/1/in-near-or-likely-to-affect-designated-sites/change`
				)
				.send({
					inNearOrLikelyToAffectDesignatedSitesCheckboxes: 'none',
					customDesignation: ''
				});

			expect(mockedLPAQPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/2/lpa-questionnaire/1'
			);
		});

		it('should call the PATCH LPA questionnaire endpoint with the same payload as if the "None" checkbox were checked and redirect to the LPA Questionnaire page if no checkboxes are checked', async () => {
			const mockedLPAQPatchEndpoint = nock('http://test/')
				.patch('/appeals/2/lpa-questionnaires/1')
				.reply(200, {});

			const response = await request
				.post(
					`${baseUrl}/2/lpa-questionnaire/1/in-near-or-likely-to-affect-designated-sites/change`
				)
				.send({
					customDesignation: ''
				});

			expect(mockedLPAQPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/2/lpa-questionnaire/1'
			);
		});
	});
});
