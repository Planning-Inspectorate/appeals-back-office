import {
	appealData,
	appealDataFullPlanning,
	lpaQuestionnaireData
} from '#testing/app/fixtures/referencedata.js';

import { createTestEnvironment } from '#testing/index.js';

import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
const lpaQuestionnaireUrl = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`;

describe('significant-changes', () => {
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
		it('should render the significant changes page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireData);
			const response = await request.get(
				`${lpaQuestionnaireUrl}/any-significant-changes-lpa/change`
			);
			const mainInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain(
				'Have there been any significant changes that would affect the application?</h1>'
			);

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);
			expect(backLinkInnerHtml).toContain(`href="${lpaQuestionnaireUrl}`);
		});

		it('should render the significant changes page with pre-filled data', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireData,
					anySignificantChangesLpa: 'Yes',
					anySignificantChangesLpa_localPlanSignificantChanges: 'Some local plan change',
					anySignificantChangesLpa_nationalPolicySignificantChanges: 'Some national policy change',
					anySignificantChangesLpa_otherSignificantChanges: '',
					anySignificantChangesLpa_courtJudgementSignificantChanges: ''
				});

			const response = await request.get(
				`${lpaQuestionnaireUrl}/any-significant-changes-lpa/change`
			);

			const mainInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(response.statusCode).toEqual(200);

			expect(mainInnerHtml).toMatchSnapshot();
			expect(mainInnerHtml).toContain(
				'Have there been any significant changes that would affect the application?</h1>'
			);
			expect(mainInnerHtml).toContain(
				`type="checkbox" value="anySignificantChangesLpa_localPlanSignificantChanges" checked`
			);
			expect(mainInnerHtml).toContain(
				`type="checkbox" value="anySignificantChangesLpa_nationalPolicySignificantChanges" checked`
			);
			expect(mainInnerHtml).not.toContain(
				`type="checkbox" value="anySignificantChangesLpa_otherSignificantChanges" checked`
			);
			expect(mainInnerHtml).not.toContain(
				`type="checkbox" value="anySignificantChangesLpa_courtJudgementSignificantChanges" checked`
			);
		});
	});

	describe('POST /change', () => {
		it('should re-render the page with an error if no radio button is selected', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireData);
			const invalidData = {};
			const response = await request
				.post(`${lpaQuestionnaireUrl}/any-significant-changes-lpa/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain(
				'Select a significant change, or select ‘There have been no significant changes’</a>'
			);
		});
		it('should re-render the page with an error if a reason is selected but no details are provided', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireData);
			const invalidData = {
				anySignificantChangesReasonLpaCheckboxes: [
					'anySignificantChangesLpa_localPlanSignificantChanges'
				],
				anySignificantChangesLpa_localPlanSignificantChanges: '',
				anySignificantChangesLpa_nationalPolicySignificantChanges: '',
				anySignificantChangesLpa_otherSignificantChanges: '',
				anySignificantChangesLpa_courtJudgementSignificantChanges: ''
			};
			const response = await request
				.post(`${lpaQuestionnaireUrl}/any-significant-changes-lpa/change`)
				.send(invalidData);

			const elementInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(response.statusCode).toEqual(400);
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('There is a problem');
			expect(elementInnerHtml).toContain(
				'Enter the significant changes and why they’re relevant</a>'
			);
		});
	});
});
