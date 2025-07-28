import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { jest } from '@jest/globals';
import {
	lpaQuestionnaireDataNotValidated,
	lpaQuestionnaireDataIncompleteOutcome,
	lpaQuestionnaireDataCompleteOutcome,
	lpaQuestionnaireIncompleteReasons,
	documentFolderInfo,
	additionalDocumentsFolderInfo,
	documentFileInfo,
	documentFileVersionsInfo,
	documentFileVersionsInfoNotChecked,
	documentFileVersionsInfoVirusFound,
	documentFileVersionsInfoChecked,
	documentFileMultipleVersionsInfoWithLatestAsLateEntry,
	documentRedactionStatuses,
	activeDirectoryUsersData,
	appealData,
	notCheckedDocumentFolderInfoDocuments,
	lpaQuestionnaireData,
	fileUploadInfo,
	lpaNotificationMethodsData,
	text300Characters,
	text301Characters,
	designatedSiteNames,
	lpaDesignatedSites
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { textInputCharacterLimits } from '../../../appeal.constants.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { cloneDeep } from 'lodash-es';
import { addDays } from 'date-fns';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	APPEAL_VIRUS_CHECK_STATUS,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_STAGE,
	APPEAL_DOCUMENT_TYPE
} from '@planning-inspectorate/data-model';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details/1/lpa-questionnaire/2';
const notificationBannerElement = '.govuk-notification-banner';
const incompleteReasonIds = lpaQuestionnaireIncompleteReasons.map((reason) => reason.id);
const incompleteReasonsWithText = lpaQuestionnaireIncompleteReasons.filter(
	(reason) => reason.hasText === true
);
const incompleteReasonsWithoutText = lpaQuestionnaireIncompleteReasons.filter(
	(reason) => reason.hasText === false
);
const incompleteReasonsWithTextIds = incompleteReasonsWithText.map((reason) => reason.id);
const incompleteReasonsWithoutTextIds = incompleteReasonsWithoutText.map((reason) => reason.id);

const lpaqAdditionalDocumentsFolderInfo = {
	...additionalDocumentsFolderInfo,
	path: 'lpa-questionnaire/lpaCaseCorrespondence'
};

const lpaqAppealData = {
	...appealData,
	documentationSummary: {
		...appealData.documentationSummary,
		lpaQuestionnaire: {
			...appealData.documentationSummary.lpaQuestionnaire,
			status: 'received'
		}
	}
};

const appealDataFullPlanning = {
	...lpaqAppealData,
	appealType: 'Planning appeal'
};

const appealDataCasPlanning = {
	...lpaqAppealData,
	appealType: 'CAS planning'
};

describe('LPA Questionnaire review', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('Notification banners', () => {
		it('should render a success notification banner when "is correct appeal type" is updated', async () => {
			nock('http://test/').patch(`/appeals/1/lpa-questionnaires/2`).reply(200, {});
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/2`)
				.reply(200, lpaQuestionnaireData)
				.persist();

			const validData = {
				correctAppealTypeRadio: 'no'
			};

			await request.post(`${baseUrl}/is-correct-appeal-type/change`).send(validData);

			const caseDetailsResponse = await request.get(`${baseUrl}`);

			const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
				rootElement: notificationBannerElement
			}).innerHTML;
			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Success');
			expect(notificationBannerElementHTML).toContain(
				'Correct appeal type (LPA response) has been updated'
			);
		}, 10000);

		it('should render a success notification banner when "green belt" is updated', async () => {
			const appealId = lpaqAppealData.appealId.toString();
			const lpaQuestionnaireId = lpaqAppealData.lpaQuestionnaireId;
			const lpaQuestionnaireUrl = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`;
			const apiUrl = `/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`;
			nock('http://test/').get(apiUrl).reply(200, lpaQuestionnaireData).persist();
			nock('http://test/').patch(apiUrl).reply(200, {});

			const validData = {
				greenBeltRadio: 'yes'
			};

			await request.post(`${lpaQuestionnaireUrl}/green-belt/change/lpa`).send(validData);

			const caseDetailsResponse = await request.get(`${lpaQuestionnaireUrl}`);

			const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
				rootElement: notificationBannerElement
			}).innerHTML;
			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Success</h3>');
			expect(notificationBannerElementHTML).toContain('Green belt status updated');
		});

		it('should render a "Inspector access (lpa) updated" success notification banner when the inspector access (lpa) is updated', async () => {
			const appealId = lpaqAppealData.appealId;
			const lpaQuestionnaireId = lpaqAppealData.lpaQuestionnaireId;
			const validData = {
				inspectorAccessRadio: 'yes',
				inspectorAccessDetails: 'Details'
			};

			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataNotValidated);

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...validData
				});

			await request.post(`${baseUrl}/inspector-access/change/lpa`).send(validData);

			const response = await request.get(`${baseUrl}`);
			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;

			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Success');
			expect(notificationBannerElementHTML).toContain('Inspector access (lpa) updated');
		}, 10000);

		it('should render a "Safety risks updated" success notification banner when the safety risks (lpa) is updated', async () => {
			const appealId = lpaqAppealData.appealId;
			const lpaQuestionnaireId = lpaqAppealData.lpaQuestionnaireId;
			const validData = {
				safetyRisksRadio: 'yes',
				safetyRisksDetails: 'Details'
			};

			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataNotValidated);

			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {
					...validData
				});

			await request.post(`${baseUrl}/safety-risks/change/lpa`).send(validData);

			const response = await request.get(`${baseUrl}`);
			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;

			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Success');
			expect(notificationBannerElementHTML).toContain(
				'Site health and safety risks (LPA answer) updated'
			);
		}, 10000);

		it('should render a "Address added" success notification banner when a neighbouring site was added', async () => {
			nock('http://test/').get(`/appeals/1`).reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/2`)
				.reply(200, lpaQuestionnaireData)
				.persist();
			nock('http://test/')
				.post(`/appeals/1/neighbouring-sites`)
				.reply(200, {
					siteId: 1,
					address: {
						addressLine1: '1 Grove Cottage',
						addressLine2: 'Shotesham Road',
						country: 'United Kingdom',
						county: 'Devon',
						postcode: 'NR35 2ND',
						town: 'Woodton'
					}
				});

			await request.post(`${baseUrl}/neighbouring-sites/add/lpa`).send({
				addressLine1: '1 Grove Cottage',
				addressLine2: null,
				county: 'Devon',
				postCode: 'NR35 2ND',
				town: 'Woodton'
			});

			await request.post(`${baseUrl}/neighbouring-sites/add/lpa/check-and-confirm`);

			const response = await request.get(`${baseUrl}`);
			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;
			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Address added');
			expect(notificationBannerElementHTML).toContain('Success');
		});

		it('should render a "Address updated" success notification banner when an inspector/3rd party neighbouring site was updated', async () => {
			nock('http://test/').patch(`/appeals/1/neighbouring-sites`).reply(200, {
				siteId: 1
			});
			nock('http://test/').get(`/appeals/1`).reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/2`)
				.reply(200, lpaQuestionnaireData)
				.persist();

			await request.post(`${baseUrl}/neighbouring-sites/change/site/1`).send({
				addressLine1: '2 Grove Cottage',
				addressLine2: null,
				county: 'Devon',
				postCode: 'NR35 2ND',
				town: 'Woodton'
			});

			await request.post(`${baseUrl}/neighbouring-sites/change/site/1/check-and-confirm`);

			const response = await request.get(`${baseUrl}`);
			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;
			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Address updated');
			expect(notificationBannerElementHTML).toContain('Success');
		});

		it('should render a "Address removed" success notification banner when an inspector/3rd party neighbouring site was removed', async () => {
			const appealReference = '1';

			nock('http://test/').delete(`/appeals/${appealReference}/neighbouring-sites`).reply(200, {
				siteId: 1
			});
			nock('http://test/').get(`/appeals/1`).reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/2`)
				.reply(200, lpaQuestionnaireData)
				.persist();
			await request.post(`${baseUrl}/neighbouring-sites/remove/site/1`).send({
				'remove-neighbouring-site': 'yes'
			});

			const response = await request.get(`${baseUrl}`);

			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;
			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Success');
			expect(notificationBannerElementHTML).toContain('Address removed');
		});

		it('should render an "LPA questionnaire incomplete" notification banner, including the LPA questionnaire due date, when the LPA questionnaire is marked as incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome);

			const response = await request.get(baseUrl);
			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;

			expect(notificationBannerElementHTML).toMatchSnapshot();

			const unprettifiedNotificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement,
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedNotificationBannerElementHTML).toContain(
				'LPA Questionnaire is incomplete</h3>'
			);
			expect(unprettifiedNotificationBannerElementHTML).toContain('Due date</dt>');
			expect(unprettifiedNotificationBannerElementHTML).toContain('11 October 2023</dd>');
			expect(unprettifiedNotificationBannerElementHTML).toContain('Policies are missing</span>');
			expect(unprettifiedNotificationBannerElementHTML).toContain('test reason 1</li>');
			expect(unprettifiedNotificationBannerElementHTML).toContain(
				'Other documents or information are missing</span>'
			);
			expect(unprettifiedNotificationBannerElementHTML).toContain('test reason 2</li>');
			expect(unprettifiedNotificationBannerElementHTML).toContain('test reason 3</li>');
			expect(unprettifiedNotificationBannerElementHTML).toContain('Other</span>');
			expect(unprettifiedNotificationBannerElementHTML).toContain('test reason 4</li>');
			expect(unprettifiedNotificationBannerElementHTML).toContain('test reason 5</li>');
			expect(unprettifiedNotificationBannerElementHTML).toContain('test reason 6</li>');
		});

		it('should not render an "LPA questionnaire incomplete" notification banner when the LPA questionnaire is marked as incomplete and then marked as complete', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome);

			const incompleteOutcomeResponse = await request.get(baseUrl);

			const unprettifiedNotificationBannerElementHTML = parseHtml(incompleteOutcomeResponse.text, {
				rootElement: notificationBannerElement,
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedNotificationBannerElementHTML).toContain(
				'LPA Questionnaire is incomplete</h3>'
			);

			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataCompleteOutcome);

			const completeOutcomeResponse = await request.get(baseUrl);

			const unprettifiedCompleteOutcomeHTML = parseHtml(completeOutcomeResponse.text, {
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedCompleteOutcomeHTML).not.toContain('LPA Questionnaire is incomplete</h3>');
		});

		it('should render a "Notification methods updated" success notification banner when notification methods are changed', async () => {
			nock('http://test/').get(`/appeals/1`).reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/2`)
				.reply(200, lpaQuestionnaireData)
				.persist();
			nock('http://test/')
				.get('/appeals/lpa-notification-methods')
				.reply(200, lpaNotificationMethodsData);
			nock('http://test/').patch(`/appeals/1/lpa-questionnaires/1`).reply(200, {});

			await request.post(`${baseUrl}/notification-methods/change`).send({});

			const response = await request.get(`${baseUrl}`);

			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;
			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Success');
			expect(notificationBannerElementHTML).toContain('Notification methods updated');
		});

		it('should render a "Column 2 threshold criteria status changed" success notification banner when meets eia column two threshold is changed', async () => {
			nock('http://test/').get(`/appeals/1`).reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/2`)
				.reply(200, lpaQuestionnaireDataNotValidated)
				.persist();
			nock('http://test/').patch(`/appeals/1/lpa-questionnaires/2`).reply(200, {});

			await request
				.post(`${baseUrl}/environmental-impact-assessment/column-two-threshold/change`)
				.send({
					eiaColumnTwoThreshold: 'yes'
				});

			const response = await request.get(`${baseUrl}`);

			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;
			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Success');
			expect(notificationBannerElementHTML).toContain('Column 2 threshold criteria status changed');
		});

		it('should render an "Environmental statement status changed" success notification banner when eia requires environmental statement is changed', async () => {
			nock('http://test/').get(`/appeals/1`).reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/2`)
				.reply(200, lpaQuestionnaireDataNotValidated)
				.persist();
			nock('http://test/').patch(`/appeals/1/lpa-questionnaires/2`).reply(200, {});

			await request
				.post(`${baseUrl}/environmental-impact-assessment/requires-environmental-statement/change`)
				.send({
					eiaRequiresEnvironmentalStatement: 'yes'
				});

			const response = await request.get(`${baseUrl}`);

			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;
			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Success');
			expect(notificationBannerElementHTML).toContain('Environmental statement status changed');
		});

		it('should render a "Description of development updated" success notification banner when eia development description is changed', async () => {
			nock('http://test/').get(`/appeals/1`).reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/2`)
				.reply(200, lpaQuestionnaireDataNotValidated)
				.persist();
			nock('http://test/').patch(`/appeals/1/lpa-questionnaires/2`).reply(200, {});

			await request.post(`${baseUrl}/eia-development-description/change`).send({
				eiaDevelopmentDescription: 'agriculture-aquaculture'
			});

			const response = await request.get(`${baseUrl}`);

			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;
			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Success');
			expect(notificationBannerElementHTML).toContain('Description of development updated');
		});

		it('should render a "Development category updated" success notification banner when eia environmental impact schedule is changed', async () => {
			nock('http://test/').get(`/appeals/1`).reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/2`)
				.reply(200, lpaQuestionnaireDataNotValidated)
				.persist();
			nock('http://test/').patch(`/appeals/1/lpa-questionnaires/2`).reply(200, {});

			await request.post(`${baseUrl}/eia-environmental-impact-schedule/change`).send({
				eiaEnvironmentalImpactSchedule: 'schedule-1'
			});

			const response = await request.get(`${baseUrl}`);

			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;
			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Success');
			expect(notificationBannerElementHTML).toContain('Development category updated');
		});

		it('should render an "In, near or likely to effect designated sites changed" success notification banner when designated sites are changed', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/2')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2
				})
				.persist();
			nock('http://test/').get('/appeals/lpa-designated-sites').reply(200, lpaDesignatedSites);
			nock('http://test/')
				.get('/appeals/2/lpa-questionnaires/1')
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					lpaQuestionnaireId: 1,
					designatedSiteNames: []
				})
				.persist();
			nock('http://test/').patch('/appeals/2/lpa-questionnaires/1').reply(200, {});

			const changePageResponse = await request
				.post(
					'/appeals-service/appeal-details/2/lpa-questionnaire/1/in-near-or-likely-to-affect-designated-sites/change'
				)
				.send({
					inNearOrLikelyToAffectDesignatedSitesCheckboxes: 'SSSI',
					customDesignation: ''
				});

			expect(changePageResponse.statusCode).toBe(302);

			const response = await request.get('/appeals-service/appeal-details/2/lpa-questionnaire/1');

			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: notificationBannerElement
			}).innerHTML;

			expect(notificationBannerElementHTML).toContain('Success');
			expect(notificationBannerElementHTML).toContain(
				'In, near or likely to effect designated sites changed'
			);
		});

		describe('banner ordering', () => {
			it('should render success banners before (above) important banners', async () => {
				const appealId = lpaqAppealData.appealId.toString();
				const lpaQuestionnaireId = lpaqAppealData.lpaQuestionnaireId;

				nock('http://test/')
					.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, lpaQuestionnaireDataIncompleteOutcome);
				nock('http://test/')
					.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, {});

				await request
					.post(
						`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/green-belt/change/lpa`
					)
					.send({
						greenBeltRadio: 'yes'
					});

				const response = await request.get(
					`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
				);

				expect(response.statusCode).toBe(200);

				const firstBannerHtml = parseHtml(response.text, {
					rootElement: `.govuk-notification-banner[data-index='0']`,
					skipPrettyPrint: true
				}).innerHTML;
				expect(firstBannerHtml).toContain(
					'<h3 class="govuk-notification-banner__title" id="govuk-notification-banner-title"> Success</h3>'
				);

				const secondBannerHtml = parseHtml(response.text, {
					rootElement: `.govuk-notification-banner[data-index='1']`,
					skipPrettyPrint: true
				}).innerHTML;
				expect(secondBannerHtml).toContain(
					'<h3 class="govuk-notification-banner__title" id="govuk-notification-banner-title"> LPA Questionnaire is incomplete</h3>'
				);
			});
		});

		describe('Document added success banners', () => {
			const appealId = 2;
			const lpaQuestionnaireId = 2;
			const folderId = 1;
			const lpaQuestionnaireUrl = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`;
			const testCases = [
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED}`,
					label: 'Who was notified about the application'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_SITE_NOTICE}`,
					label: 'Site notice'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_LETTER_TO_NEIGHBOURS}`,
					label: 'Letter or email notification'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_PRESS_ADVERT}`,
					label: 'Press advert notification'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.CONSERVATION_MAP}`,
					label: 'Conservation area map and guidance'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.OTHER_PARTY_REPRESENTATIONS}`,
					label: 'Representations from other parties documents'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.PLANNING_OFFICER_REPORT}`,
					label: 'Planning officer’s report'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS}`,
					label: 'Plans, drawings and list of plans'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.DEVELOPMENT_PLAN_POLICIES}`,
					label: 'Relevant policies from statutory development plan'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.TREE_PRESERVATION_PLAN}`,
					label: 'Tree Preservation Order'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.DEFINITIVE_MAP_STATEMENT}`,
					label: 'Definitive map and statement extract'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY}`,
					label: 'Community infrastructure levy'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.SUPPLEMENTARY_PLANNING}`,
					label: 'Supplementary planning documents'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EMERGING_PLAN}`,
					label: 'Emerging plan relevant to appeal'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.CONSULTATION_RESPONSES}`,
					label: 'Consultation responses or standing advice'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT}`,
					label: 'Environmental statement'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EIA_SCREENING_OPINION}`,
					label: 'Screening opinion documents'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EIA_SCOPING_OPINION}`,
					label: 'Scoping opinion documents'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EIA_SCREENING_DIRECTION}`,
					label: 'Screening direction documents'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.LPA_CASE_CORRESPONDENCE}`,
					label: 'Additional documents'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.OTHER_RELEVANT_POLICIES}`,
					label: 'Other relevant policies'
				},
				{
					folderPath: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.APPEAL_NOTIFICATION}`,
					label: 'Appeal notification letter'
				}
			];

			beforeEach(() => {
				nock.cleanAll();
				nock('http://test/')
					.get(`/appeals/${appealId}`)
					.reply(200, {
						...lpaqAppealData,
						appealId
					})
					.persist();
				nock('http://test/')
					.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireData,
						appealId,
						lpaQuestionnaireId
					});
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/').post(`/appeals/${appealId}/documents`).reply(200);
			});

			for (const testCase of testCases) {
				it(`should render a "${testCase.label} added" success banner when uploading a document in the "${testCase.folderPath}" folder to the lpa questionnaire`, async () => {
					nock('http://test/')
						.get(`/appeals/${appealId}/document-folders/1`)
						.reply(200, {
							caseId: appealId,
							documents: [],
							folderId: folderId,
							path: testCase.folderPath
						})
						.persist();

					const addDocumentsResponse = await request
						.post(`${lpaQuestionnaireUrl}/add-documents/${folderId}`)
						.send({
							'upload-info': fileUploadInfo
						});

					expect(addDocumentsResponse.statusCode).toBe(302);

					const postCheckAndConfirmResponse = await request
						.post(`${lpaQuestionnaireUrl}/add-documents/${folderId}/check-your-answers`)
						.send({});

					expect(postCheckAndConfirmResponse.statusCode).toBe(302);
					expect(postCheckAndConfirmResponse.text).toBe(
						`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
					);

					const lpaQuestionnaireResponse = await request.get(`${lpaQuestionnaireUrl}`);

					expect(lpaQuestionnaireResponse.statusCode).toBe(200);

					const notificationBannerElementHTML = parseHtml(lpaQuestionnaireResponse.text, {
						rootElement: notificationBannerElement
					}).innerHTML;

					expect(notificationBannerElementHTML).toContain('Success</h3>');
					expect(notificationBannerElementHTML).toContain(`${testCase.label} added`);
				});
			}

			it('should render a fallback "Documents added" success banner when uploading a document in an unhandled folder to the lpa questionnaire', async () => {
				nock('http://test/')
					.get(`/appeals/${appealId}/document-folders/1`)
					.reply(200, {
						caseId: appealId,
						documents: [],
						folderId: folderId,
						path: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/unhandledFolderPath`
					})
					.persist();

				const addDocumentsResponse = await request
					.post(`${lpaQuestionnaireUrl}/add-documents/${folderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const postCheckAndConfirmResponse = await request
					.post(`${lpaQuestionnaireUrl}/add-documents/${folderId}/check-your-answers`)
					.send({});

				expect(postCheckAndConfirmResponse.statusCode).toBe(302);
				expect(postCheckAndConfirmResponse.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
				);

				const lpaQuestionnaireResponse = await request.get(`${lpaQuestionnaireUrl}`);

				expect(lpaQuestionnaireResponse.statusCode).toBe(200);

				const notificationBannerElementHTML = parseHtml(lpaQuestionnaireResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain(`Documents added`);
			});
		});
	});

	describe('GET /', () => {
		it('should render the Householder LPA Questionnaire page with the expected content', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataNotValidated);

			const response = await request.get(baseUrl);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('LPA questionnaire</h1>');

			expect(element.innerHTML).toContain('1. Constraints, designations and other issues</h2>');
			expect(element.innerHTML).toContain('Is householder the correct type of appeal?</dt>');
			expect(element.innerHTML).toContain(
				'Does the development affect the setting of listed buildings?</dt>'
			);
			expect(element.innerHTML).toContain('Conservation area map and guidance</dt>');
			expect(element.innerHTML).toContain('Green belt</dt>');

			expect(element.innerHTML).toContain('2. Notifying relevant parties</h2>');
			expect(element.innerHTML).toContain('Who did you notify about this application?</dt>');
			expect(element.innerHTML).toContain(
				'How did you notify relevant parties about this application?</dt>'
			);
			expect(element.innerHTML).toContain('Site notice</dt>');
			expect(element.innerHTML).toContain('Letter or email notification</dt>');
			expect(element.innerHTML).toContain('Press advertisement</dt>');
			expect(element.innerHTML).toContain('Appeal notification letter</dt>');

			expect(element.innerHTML).toContain('3. Consultation responses and representations</h2>');
			expect(element.innerHTML).toContain(
				'Representations from members of the public or other parties</dt>'
			);

			expect(element.innerHTML).toContain(
				'4. Planning officer’s report and supplementary documents</h2>'
			);
			expect(element.innerHTML).toContain('Planning officer’s report</dt>');
			expect(element.innerHTML).toContain('Plans, drawings and list of plans</dt>');
			expect(element.innerHTML).toContain('Relevant policies from statutory development plan</dt>');
			expect(element.innerHTML).toContain('Supplementary planning documents</dt>');
			expect(element.innerHTML).toContain('Emerging plan relevant to appeal</dt>');

			expect(element.innerHTML).toContain('5. Site access</h2>');
			expect(element.innerHTML).toContain(
				'Might the inspector need access to the appellant’s land or property?</dt>'
			);
			expect(element.innerHTML).toContain('Address of the neighbour’s land or property</dt>');
			expect(element.innerHTML).toContain('Are there any potential safety risks?</dt>');

			expect(element.innerHTML).toContain('6. Appeal process</h2>');
			expect(element.innerHTML).toContain(
				'Are there any other ongoing appeals next to, or close to the site?</dt>'
			);
			expect(element.innerHTML).toContain('Are there any new conditions?</dt>');

			expect(element.innerHTML).toContain('Additional documents</h2>');
		}, 10000);

		it('should render the S78 LPA Questionnaire page with the expected content', async () => {
			nock('http://test/')
				.get('/appeals/2')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/lpa-questionnaires/1')
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					lpaQuestionnaireId: 1
				});

			const response = await request.get('/appeals-service/appeal-details/2/lpa-questionnaire/1');
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('LPA questionnaire</h1>');
			expect(element.innerHTML).toContain('1. Constraints, designations and other issues</h2>');
			expect(element.innerHTML).toContain('2. Environmental impact assessment</h2>');
			expect(element.innerHTML).toContain('3. Notifying relevant parties</h2>');
			expect(element.innerHTML).toContain('4. Consultation responses and representations</h2>');
			expect(element.innerHTML).toContain(
				'5. Planning officer’s report and supplementary documents</h2>'
			);
			expect(element.innerHTML).toContain('6. Site access</h2>');
			expect(element.innerHTML).toContain('7. Appeal process</h2>');
			expect(element.innerHTML).toContain('Additional documents</h2>');
		}, 10000);

		it('should render the CAS planning LPA Questionnaire page with the expected content', async () => {
			nock('http://test/')
				.get('/appeals/3')
				.reply(200, {
					...appealDataCasPlanning,
					appealId: 3
				});
			nock('http://test/')
				.get('/appeals/3/lpa-questionnaires/1')
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					lpaQuestionnaireId: 1
				});

			const response = await request.get('/appeals-service/appeal-details/3/lpa-questionnaire/1');
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('LPA questionnaire</h1>');

			expect(element.innerHTML).toContain('1. Constraints, designations and other issues</h2>');
			expect(element.innerHTML).toContain('Is CAS planning the correct type of appeal?</dt>');
			expect(element.innerHTML).toContain(
				'Does the development affect the setting of listed buildings?</dt>'
			);
			expect(element.innerHTML).toContain('Conservation area map and guidance</dt>');
			expect(element.innerHTML).toContain('Green belt</dt>');

			expect(element.innerHTML).toContain('2. Notifying relevant parties</h2>');
			expect(element.innerHTML).toContain('Who did you notify about this application?</dt>');
			expect(element.innerHTML).toContain(
				'How did you notify relevant parties about this application?</dt>'
			);
			expect(element.innerHTML).toContain('Site notice</dt>');
			expect(element.innerHTML).toContain('Letter or email notification</dt>');
			expect(element.innerHTML).toContain('Press advertisement</dt>');
			expect(element.innerHTML).toContain('Appeal notification letter</dt>');

			expect(element.innerHTML).toContain('3. Consultation responses and representations</h2>');
			expect(element.innerHTML).toContain(
				'Representations from members of the public or other parties</dt>'
			);

			expect(element.innerHTML).toContain(
				'4. Planning officer’s report and supplementary documents</h2>'
			);
			expect(element.innerHTML).toContain('Planning officer’s report</dt>');
			expect(element.innerHTML).not.toContain('Plans, drawings and list of plans</dt>'); // here CAS differs from HAS
			expect(element.innerHTML).toContain('Relevant policies from statutory development plan</dt>');
			expect(element.innerHTML).toContain('Supplementary planning documents</dt>');
			expect(element.innerHTML).toContain('Emerging plan relevant to appeal</dt>');

			expect(element.innerHTML).toContain('5. Site access</h2>');
			expect(element.innerHTML).toContain(
				'Might the inspector need access to the appellant’s land or property?</dt>'
			);
			expect(element.innerHTML).toContain('Address of the neighbour’s land or property</dt>');
			expect(element.innerHTML).toContain('Are there any potential safety risks?</dt>');

			expect(element.innerHTML).toContain('6. Appeal process</h2>');
			expect(element.innerHTML).toContain(
				'Are there any other ongoing appeals next to, or close to the site?</dt>'
			);
			expect(element.innerHTML).toContain('Are there any new conditions?</dt>');

			expect(element.innerHTML).toContain('Additional documents</h2>');
		}, 10000);

		it('should render review outcome form fields and controls when the appeal is in "LPA Questionnaire" status', async () => {
			nock('http://test/')
				.get(`/appeals/2`)
				.reply(200, {
					...lpaqAppealData,
					appealId: 2,
					appealStatus: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
				});
			nock('http://test/')
				.get('/appeals/2/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataNotValidated);

			const response = await request.get('/appeals-service/appeal-details/2/lpa-questionnaire/2');
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'What is the outcome of your review?</legend>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="review-outcome" type="radio" value="complete">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="review-outcome" type="radio" value="incomplete">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Confirming this review will inform the relevant parties of the outcome.</div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		}, 10000);

		const appealStatusesWithoutLPAQuestionnaire = Object.values(APPEAL_CASE_STATUS).filter(
			(status) => status !== APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
		);

		for (const appealStatus of appealStatusesWithoutLPAQuestionnaire) {
			it(`should not render review outcome form fields or controls when the appeal is not in "LPA Questionnaire" status (${appealStatus})`, async () => {
				nock('http://test/')
					.get(`/appeals/3`)
					.reply(200, {
						...lpaqAppealData,
						appealId: 3,
						appealStatus
					});
				nock('http://test/')
					.get('/appeals/3/lpa-questionnaires/3')
					.reply(200, lpaQuestionnaireDataNotValidated);

				const response = await request.get('/appeals-service/appeal-details/3/lpa-questionnaire/3');
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).not.toContain(
					'What is the outcome of your review?</legend>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'name="reviewOutcome" type="radio" value="valid">'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'name="reviewOutcome" type="radio" value="invalid">'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'name="reviewOutcome" type="radio" value="incomplete">'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('Continue</button>');
			}, 50000);
		}

		describe('show more', () => {
			describe('site access required', () => {
				it('should not render a "show more" component on the "site access required" row if the associated value is less than or equal to 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/1/lpa-questionnaires/2')
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							siteAccessRequired: {
								isRequired: true,
								details: text300Characters
							}
						});

					const response = await request.get(baseUrl);
					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#site-access-summary',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"><span>Yes</span><br><span>${text300Characters}</span></dd>`
					);
					expect(unprettifiedElement.innerHTML).not.toContain('class="pins-show-more"');
				});

				it('should render a "show more" component with the expected HTML on the "site access required" row if the associated value is over 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/1/lpa-questionnaires/2')
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							siteAccessRequired: {
								isRequired: true,
								details: text301Characters
							}
						});

					const response = await request.get(baseUrl);
					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#site-access-summary',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"><span>Yes</span><br><div class="pins-show-more" data-label="Site access required details" data-mode="text">${text301Characters}</div></dd>`
					);
				});
			});

			describe('potential safety risks', () => {
				it('should not render a "show more" component on the "potential safety risks" row if the associated value is less than or equal to 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/1/lpa-questionnaires/2')
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							healthAndSafety: {
								hasIssues: true,
								details: text300Characters
							}
						});

					const response = await request.get(baseUrl);
					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#site-access-summary',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"><span>Yes</span><br><span>${text300Characters}</span></dd>`
					);
					expect(unprettifiedElement.innerHTML).not.toContain('class="pins-show-more"');
				});

				it('should render a "show more" component with the expected HTML on the "potential safety risks" row if the associated value is over 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/1/lpa-questionnaires/2')
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							healthAndSafety: {
								hasIssues: true,
								details: text301Characters
							}
						});

					const response = await request.get(baseUrl);
					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#site-access-summary',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"><span>Yes</span><br><div class="pins-show-more" data-label="Potential safety risks details" data-mode="text">${text301Characters}</div></dd>`
					);
				});
			});

			describe('extra conditions', () => {
				it('should not render a "show more" component on the "extra conditions" row if the associated value is less than or equal to 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/1/lpa-questionnaires/2')
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							hasExtraConditions: true,
							extraConditions: text300Characters
						});

					const response = await request.get(baseUrl);
					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#appeal-process-summary',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"><span>Yes</span><br><span>${text300Characters}</span></dd>`
					);
					expect(unprettifiedElement.innerHTML).not.toContain('class="pins-show-more"');
				});

				it('should render a "show more" component with the expected HTML on the "extra conditions" row if the associated value is over 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/1/lpa-questionnaires/2')
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							hasExtraConditions: true,
							extraConditions: text301Characters
						});

					const response = await request.get(baseUrl);
					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#appeal-process-summary',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"><span>Yes</span><br><div class="pins-show-more" data-label="Extra conditions details" data-mode="text">${text301Characters}</div></dd>`
					);
				});
			});
		});

		describe('designated-sites', () => {
			it('should not render a designated sites row in the LPAQ for householder appeals', async () => {
				nock('http://test/')
					.get('/appeals/1/lpa-questionnaires/2')
					.reply(200, lpaQuestionnaireDataNotValidated);

				const response = await request.get(baseUrl);
				const unprettifiedHtml = parseHtml(response.text, {
					rootElement: '#constraints-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHtml).not.toContain('designated sites');
			});

			it('should render a designated sites row with the expected label for s78/full planning appeals', async () => {
				nock('http://test/')
					.get('/appeals/2')
					.reply(200, {
						...appealDataFullPlanning,
						appealId: 2
					});
				nock('http://test/')
					.get('/appeals/2/lpa-questionnaires/1')
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						lpaQuestionnaireId: 1,
						designatedSiteNames
					});

				const response = await request.get('/appeals-service/appeal-details/2/lpa-questionnaire/1');

				const unprettifiedHtml = parseHtml(response.text, {
					rootElement: '#constraints-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHtml).toContain(
					'<dt class="govuk-summary-list__key"> Is the development in, near or likely to affect any designated sites?</dt>'
				);
			});

			it('should render a designated sites row with the expected value of "No" as plaintext if LPAQ designatedSiteNames array is empty', async () => {
				nock('http://test/')
					.get('/appeals/2')
					.reply(200, {
						...appealDataFullPlanning,
						appealId: 2
					});
				nock('http://test/')
					.get('/appeals/2/lpa-questionnaires/1')
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						lpaQuestionnaireId: 1,
						designatedSiteNames: []
					});

				const response = await request.get('/appeals-service/appeal-details/2/lpa-questionnaire/1');

				const unprettifiedHtml = parseHtml(response.text, {
					rootElement: '#constraints-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHtml).toContain('<dd class="govuk-summary-list__value"> No</dd>');
			});

			it('should render a designated sites row with the expected value as plaintext if LPAQ designatedSiteNames array contains a single designated site item', async () => {
				nock('http://test/')
					.get('/appeals/2')
					.reply(200, {
						...appealDataFullPlanning,
						appealId: 2
					});
				nock('http://test/')
					.get('/appeals/2/lpa-questionnaires/1')
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						lpaQuestionnaireId: 1,
						designatedSiteNames: [designatedSiteNames[0]]
					});

				const response = await request.get('/appeals-service/appeal-details/2/lpa-questionnaire/1');

				const unprettifiedHtml = parseHtml(response.text, {
					rootElement: '#constraints-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHtml).toContain('<li>SSSI (site of special scientific interest)</li>');
			});

			it('should render a designated sites row with the expected values contained in a list if LPAQ designatedSiteNames array contains multiple designated site items', async () => {
				nock('http://test/')
					.get('/appeals/2')
					.reply(200, {
						...appealDataFullPlanning,
						appealId: 2
					});
				nock('http://test/')
					.get('/appeals/2/lpa-questionnaires/1')
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						lpaQuestionnaireId: 1,
						designatedSiteNames
					});

				const response = await request.get('/appeals-service/appeal-details/2/lpa-questionnaire/1');

				const unprettifiedHtml = parseHtml(response.text, {
					rootElement: '#constraints-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHtml).toContain(
					'<dd class="govuk-summary-list__value"> Yes<ul class="pins-summary-list-sublist"><li>SSSI (site of special scientific interest)</li><li>Other: test custom designation</li></ul></dd>'
				);
			});

			it('should render a designated sites row with the expected value of "Other: <custom designated site name>" if LPAQ designatedSiteNames array contains a custom item', async () => {
				nock('http://test/')
					.get('/appeals/2')
					.reply(200, {
						...appealDataFullPlanning,
						appealId: 2
					});
				nock('http://test/')
					.get('/appeals/2/lpa-questionnaires/1')
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						lpaQuestionnaireId: 1,
						designatedSiteNames: [designatedSiteNames[1]]
					});

				const response = await request.get('/appeals-service/appeal-details/2/lpa-questionnaire/1');

				const unprettifiedHtml = parseHtml(response.text, {
					rootElement: '#constraints-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHtml).toContain('<li>Other: test custom designation</li>');
			});
		});
	});

	describe('GET / with unchecked documents', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${lpaqAppealData.appealId}`)
				.reply(200, lpaqAppealData)
				.persist();
		});

		it('should render a notification banner when a file is unscanned', async () => {
			//Create a document with virus scan still in progress
			let updatedLPAQuestionnaireData = cloneDeep(lpaQuestionnaireDataIncompleteOutcome);
			updatedLPAQuestionnaireData.documents.conservationMap.documents.push(
				notCheckedDocumentFolderInfoDocuments
			);
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, updatedLPAQuestionnaireData);

			const response = await request.get(`${baseUrl}`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const notificationBannerElementHTML = parseHtml(response.text, {
				skipPrettyPrint: true
			}).innerHTML;

			expect(notificationBannerElementHTML).toContain('Important</h3>');
			expect(notificationBannerElementHTML).toContain('Virus scan in progress</p>');
		});

		it('should render an error when a file has a virus', async () => {
			//Create a document with failed virus check
			let updatedLPAQuestionnaireData = cloneDeep(lpaQuestionnaireDataNotValidated);
			updatedLPAQuestionnaireData.documents.conservationMap.documents.push({
				...notCheckedDocumentFolderInfoDocuments,
				// @ts-ignore
				latestDocumentVersion: {
					...notCheckedDocumentFolderInfoDocuments.latestDocumentVersion,
					virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.AFFECTED
				}
			});
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, updatedLPAQuestionnaireData);

			const response = await request.get(`${baseUrl}`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary'
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'One or more documents in this LPA questionnaire contains a virus. Upload a different version of each document that contains a virus.</a>'
			);
		});
	});

	describe('POST /', () => {
		it('should render LPA Questionnaire review with error (no answer provided)', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome);

			const response = await request.post(baseUrl).send({
				'review-outcome': ''
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary'
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Review outcome must be provided</a>');
		});

		it('should redirect to the case details page if no errors are present and posted outcome is "complete"', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome)
				.patch('/appeals/1/lpa-questionnaires/2')
				.reply(200, { validationOutcome: 'complete' });

			const response = await request.post(baseUrl).send({
				'review-outcome': 'complete'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /appeals-service/appeal-details/1/lpa-questionnaire/1/incomplete', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/lpa-questionnaire-incomplete-reasons')
				.reply(200, lpaQuestionnaireIncompleteReasons);
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the incomplete reason page', async () => {
			const response = await request.get(`${baseUrl}/incomplete`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Why is the LPA questionnaire incomplete?</h1>');
			expect(element.innerHTML).toContain('Continue</button>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('data-module="govuk-checkboxes">');
			expect(unprettifiedElement.innerHTML).toContain('Add another</button>');
		});
	});

	describe('POST /appeals-service/appeal-details/1/lpa-questionnaire/1/incomplete', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/lpa-questionnaire-incomplete-reasons')
				.reply(200, lpaQuestionnaireIncompleteReasons);

			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the incomplete reason page with the expected error message if no incomplete reason was provided', async () => {
			const response = await request.post(`${baseUrl}/incomplete`).send({});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'Please select one or more reasons why the LPA questionnaire is incomplete</a>'
			);
		});

		it('should re-render the incomplete reason page with the expected error message if a single incomplete reason with text was provided but the matching text property is an empty string', async () => {
			const response = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonsWithTextIds[0],
				[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: ''
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if a single incomplete reason with text was provided but the matching text property is an empty array', async () => {
			const response = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonsWithTextIds[0],
				[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: []
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if multiple incomplete reasons with text were provided but any of the matching text properties are empty strings', async () => {
			const response = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
				[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'test reason text 1',
				[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: ''
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if multiple incomplete reasons with text were provided but any of the matching text properties are empty arrays', async () => {
			const response = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
				[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [],
				[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: [
					'test reason text 1',
					'test reason text 2'
				]
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if a single incomplete reason with text was provided but the matching text property exceeds the character limit', async () => {
			const response = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonsWithTextIds[0],
				[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'a'.repeat(
					textInputCharacterLimits.checkboxTextItemsLength + 1
				)
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				`Text in text fields cannot exceed ${textInputCharacterLimits.checkboxTextItemsLength} characters</a>`
			);
		});

		it('should re-render the incomplete reason page with the expected error message if multiple incomplete reasons with text were provided but any of the matching text properties exceed the character limit', async () => {
			const response = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
				[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'test reason text 1',
				[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'a'.repeat(
					textInputCharacterLimits.checkboxTextItemsLength + 1
				)
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				`Text in text fields cannot exceed ${textInputCharacterLimits.checkboxTextItemsLength} characters</a>`
			);
		});

		it('should redirect to the check and confirm page if a single incomplete reason without text was provided', async () => {
			const response = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonsWithoutTextIds[0]
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/2/incomplete/date'
			);
		});

		it('should redirect to the check and confirm page if a single incomplete reason with text within the character limit was provided', async () => {
			const response = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonsWithTextIds[0],
				[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'a'.repeat(
					textInputCharacterLimits.defaultInputLength
				)
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/2/incomplete/date'
			);
		});

		it('should redirect to the check and confirm page if multiple incomplete reasons without text were provided', async () => {
			const response = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: [incompleteReasonsWithoutTextIds[0], incompleteReasonsWithoutTextIds[1]]
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/2/incomplete/date'
			);
		});

		it('should redirect to the check and confirm page if multiple incomplete reasons with text within the character limit were provided', async () => {
			const response = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
				[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
					'a'.repeat(textInputCharacterLimits.defaultInputLength),
					'test reason text 2'
				],
				[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'a'.repeat(
					textInputCharacterLimits.defaultInputLength
				)
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/2/incomplete/date'
			);
		});
	});

	describe('GET /appeals-service/appeal-details/1/lpa-questionnaire/1/incomplete/date', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/lpa-questionnaire-incomplete-reasons')
				.reply(200, lpaQuestionnaireIncompleteReasons);
			nock('http://test/')
				.get(`/appeals/1`)
				.reply(200, {
					...lpaqAppealData,
					appealId: 1
				});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the update due date page with correct pre-populated date values, if there is an existing due date', async () => {
			nock('http://test/')
				.get(`/appeals/2`)
				.reply(200, {
					...lpaqAppealData,
					appealId: 2,
					documentationSummary: {
						...lpaqAppealData.documentationSummary,
						lpaQuestionnaire: {
							...lpaqAppealData.documentationSummary.lpaQuestionnaire,
							dueDate: '2024-10-11T10:27:06.626Z'
						}
					}
				})
				.persist();

			const response = await request.get(
				'/appeals-service/appeal-details/2/lpa-questionnaire/2/incomplete/date'
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('name="due-date-day" type="text" value="11"');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-month" type="text" value="10"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-year" type="text" value="2024"'
			);
		});
	});

	describe('POST /appeals-service/appeal-details/1/lpa-questionnaire/1/incomplete/date', () => {
		/**
		 * @type {import("superagent").Response}
		 */
		let lpaQPostResponse;
		/**
		 * @type {import("superagent").Response}
		 */
		let incompleteReasonPostResponse;

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/lpa-questionnaire-incomplete-reasons')
				.reply(200, lpaQuestionnaireIncompleteReasons);
			nock('http://test/')
				.get(`/appeals/1`)
				.reply(200, {
					...lpaqAppealData,
					appealId: 1
				});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the 500 error page if required data is not present in the session', async () => {
			const response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '1',
				'due-date-month': '12',
				'due-date-year': '3000'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should re-render the update date page with the expected error message if no date was provided', async () => {
			// prerequisites to set session data
			lpaQPostResponse = await request.post(baseUrl).send({
				'review-outcome': 'incomplete'
			});
			incompleteReasonPostResponse = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonIds
			});

			expect(lpaQPostResponse.statusCode).toBe(302);
			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '',
				'due-date-month': '',
				'due-date-year': ''
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter the date');
		});

		it('should re-render the update date page with the expected error message if provided date is not in the future', async () => {
			// prerequisites to set session data
			lpaQPostResponse = await request.post(baseUrl).send({
				'review-outcome': 'incomplete'
			});
			incompleteReasonPostResponse = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonIds
			});

			expect(lpaQPostResponse.statusCode).toBe(302);
			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '1',
				'due-date-month': '1',
				'due-date-year': '2000'
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('The date must be in the future</a>');
		});

		it('should re-render the update date page with the expected error message if an invalid day was provided', async () => {
			// prerequisites to set session data
			lpaQPostResponse = await request.post(baseUrl).send({
				'review-outcome': 'incomplete'
			});
			incompleteReasonPostResponse = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonIds
			});

			expect(lpaQPostResponse.statusCode).toBe(302);
			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			let response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '0',
				'due-date-month': '1',
				'due-date-year': '3000'
			});

			expect(response.statusCode).toBe(200);

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			let errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Date day must be between 1 and 31</a>');

			response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '32',
				'due-date-month': '1',
				'due-date-year': '3000'
			});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Date day must be between 1 and 31</a>');

			response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': 'first',
				'due-date-month': '1',
				'due-date-year': '3000'
			});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Date day must be a number</a>');
		});

		it('should re-render the update date page with the expected error message if an invalid month was provided', async () => {
			// prerequisites to set session data
			lpaQPostResponse = await request.post(baseUrl).send({
				'review-outcome': 'incomplete'
			});
			incompleteReasonPostResponse = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonIds
			});

			expect(lpaQPostResponse.statusCode).toBe(302);
			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			let response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '1',
				'due-date-month': '0',
				'due-date-year': '3000'
			});

			expect(response.statusCode).toBe(200);

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			let errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Date month must be between 1 and 12</a>');

			response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '1',
				'due-date-month': '13',
				'due-date-year': '3000'
			});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Date month must be between 1 and 12</a>');

			response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '1',
				'due-date-month': 'dec',
				'due-date-year': '3000'
			});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Date month must be a number</a>');
		});

		it('should re-render the update date page with the expected error message if an invalid year was provided', async () => {
			// prerequisites to set session data
			lpaQPostResponse = await request.post(baseUrl).send({
				'review-outcome': 'incomplete'
			});
			incompleteReasonPostResponse = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonIds
			});

			expect(lpaQPostResponse.statusCode).toBe(302);
			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			let response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '1',
				'due-date-month': '1',
				'due-date-year': '23'
			});

			expect(response.statusCode).toBe(200);

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			let errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Date year must be 4 digits</a>');

			response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '1',
				'due-date-month': '1',
				'due-date-year': 'abc'
			});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Date year must be a number</a>');
		});

		it('should re-render the update date page with the expected error message if an invalid date was provided', async () => {
			// prerequisites to set session data
			lpaQPostResponse = await request.post(baseUrl).send({
				'review-outcome': 'incomplete'
			});
			incompleteReasonPostResponse = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonIds
			});

			expect(lpaQPostResponse.statusCode).toBe(302);
			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '29',
				'due-date-month': '2',
				'due-date-year': '3000'
			});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Date must be a real date</a>');
		});

		it('should redirect to the check and confirm page if a valid date was provided', async () => {
			nock('http://test/').post('/appeals/validate-business-date').reply(200, { success: true });

			// prerequisites to set session data
			lpaQPostResponse = await request.post(baseUrl).send({
				'review-outcome': 'incomplete'
			});
			incompleteReasonPostResponse = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonIds
			});

			expect(lpaQPostResponse.statusCode).toBe(302);
			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/incomplete/date`).send({
				'due-date-day': '2',
				'due-date-month': '12',
				'due-date-year': '3000'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/2/check-your-answers'
			);
		});
	});

	describe('GET /appeals-service/appeal-details/1/lpa-questionnaire/1/check-your-answers', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/lpa-questionnaire-incomplete-reasons')
				.reply(200, lpaQuestionnaireIncompleteReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the 500 error page if required data is not present in the session', async () => {
			const response = await request.get(`${baseUrl}/check-your-answers`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should render the check your answers page with the expected content if outcome is "incomplete" and required data is present in the session', async () => {
			// post to LPA questionnaire page controller is necessary to set required data in the session
			const lpaQPostResponse = await request.post(baseUrl).send({
				'review-outcome': 'incomplete'
			});

			expect(lpaQPostResponse.statusCode).toBe(302);

			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
				[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
					'test reason text 1',
					'test reason text 2'
				],
				[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
			});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const response = await request.get(`${baseUrl}/check-your-answers`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Check your answers before confirming your review</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Review outcome</dt><dd class="govuk-summary-list__value"> Incomplete</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Incomplete reasons</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Confirming this review will inform the relevant parties of the outcome.</div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /appeals-service/appeal-details/1/lpa-questionnaire/1/check-your-answers', () => {
		afterEach(() => {
			nock.cleanAll();
		});

		it('should send a patch request to the LPA questionnaire API endpoint and redirect to the case details page, if posted outcome was "incomplete"', async () => {
			// post to LPA questionnaire page controller is necessary to set required data in the session
			const lpaQPostResponse = await request.post(baseUrl).send({
				'review-outcome': 'incomplete'
			});

			expect(lpaQPostResponse.statusCode).toBe(302);

			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request.post(`${baseUrl}/incomplete`).send({
				incompleteReason: incompleteReasonIds
			});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const mockedlpaQuestionnairesEndpoint = nock('http://test/')
				.patch('/appeals/1/lpa-questionnaires/2')
				.reply(200, { validationOutcome: 'incomplete' });

			const response = await request.post(`${baseUrl}/check-your-answers`);

			expect(mockedlpaQuestionnairesEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});
	describe('GET /lpa-questionnaire/1/add-documents/:folderId/', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, lpaqAppealData);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render document upload page with a file upload component, and no late entry status tag and associated details component, and no additional documents warning text, if the folder is not additional documents', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);

			const response = await request.get(
				`/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the lpa questionnaire has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(
				`/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the lpa questionnaire has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(
				`/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with late entry status tag and associated details component, and without additional documents warning text, if the folder is additional documents, and the lpa questionnaire validation outcome is complete', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataCompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(
				`/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});
	});

	describe('GET /lpa-questionnaire/1/add-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, lpaqAppealData);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a document upload page with a file upload component, and no late entry tag and associated details component, and no additional documents warning text, if the folder is not additional documents', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1/1'
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the lpa questionnaire has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1/1'
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the lpa questionnaire has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1/1'
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with late entry status tag and associated details component, and without additional documents warning text, if the folder is additional documents, and the lpa questionnaire validation outcome is complete', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataCompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1/1'
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});
	});

	describe('GET /lpa-questionnaire/1/add-document-details/:folderId/', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-document-details/1'
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add document details page with one item per unpublished document, and without a late entry status tag and associated details component, if the folder is not additional documents', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-document-details/1'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Changed description documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per unpublished document, and without a late entry status tag and associated details component, if the folder is additional documents, and the lpa questionnaire has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, lpaqAdditionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post('/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1')
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-document-details/1'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per unpublished document, and without a late entry status tag and associated details component, if the folder is additional documents, and the lpa questionnaire has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, lpaqAdditionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post('/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1')
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-document-details/1'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per unpublished document, and with a late entry status tag and associated details component, if the folder is additional documents, and the lpa questionnaire has a validation outcome of complete', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataCompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, lpaqAdditionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post('/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1')
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-document-details/1'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
		});
	});

	describe('GET /lpa-questionnaire/1/add-document-details/:folderId/:documentId', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-document-details/1/1'
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add document details page with one item per unpublished document, and without a late entry status tag and associated details component, if the folder is not additional documents', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/1/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-document-details/1/1'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated changed description document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per unpublished document, and without a late entry status tag and associated details component, if the folder is additional documents, and the lpa questionnaire has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, lpaqAdditionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post('/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/2/1')
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-document-details/2/1'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per unpublished document, and without a late entry status tag and associated details component, if the folder is additional documents, and the lpa questionnaire has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, lpaqAdditionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post('/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/2/1')
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-document-details/2/1'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per unpublished document, and with a late entry status tag and associated details component, if the folder is additional documents, and the lpa questionnaire has a validation outcome of complete', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/1')
				.reply(200, lpaQuestionnaireDataCompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, lpaqAdditionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post('/appeals-service/appeal-details/1/lpa-questionnaire/1/add-documents/2/1')
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				'/appeals-service/appeal-details/1/lpa-questionnaire/1/add-document-details/2/1'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
		});
	});

	describe('POST /lpa-questionnaire/1/add-document-details/:folderId/', () => {
		/**
		 * @type {import("superagent").Response}
		 */
		let addDocumentsResponse;

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
			nock('http://test/')
				.patch('/appeals/1/documents')
				.reply(200, {
					documents: [
						{
							id: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: '2023-02-01',
							redactionStatus: 2
						}
					]
				});

			addDocumentsResponse = await request.post(`${baseUrl}/add-documents/1`).send({
				'upload-info': fileUploadInfo
			});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the document details page with the expected error message if the request body is in an incorrect format', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain('There is a problem with the service</a>');
		});

		it('should re-render the document details page with the expected error message if receivedDate day is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: '',
							month: '2',
							year: '2030'
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date must include a day</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: 'a',
							month: '2',
							year: '2030'
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date day must be a number</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is less than 1', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: '0',
							month: '2',
							year: '2030'
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date day must be between 1 and 31</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is greater than 31', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: '32',
							month: '2',
							year: '2030'
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date day must be between 1 and 31</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: '1',
							month: '',
							year: '2030'
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date must include a month</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: '1',
							month: 'a',
							year: '2030'
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date month must be a number</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is less than 1', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: '1',
							month: '0',
							year: '2030'
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date month must be between 1 and 12</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is greater than 12', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: '1',
							month: '13',
							year: '2030'
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date month must be between 1 and 12</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate year is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: '1',
							month: '2',
							year: ''
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date must include a year</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate year is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: '1',
							month: '2',
							year: 'a'
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date year must be a number</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate is not a valid date', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: '29',
							month: '2',
							year: '2023'
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date must be a real date</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate is in the future', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const futureDate = addDays(new Date(), 1);
			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: futureDate.getDate(),
							month: futureDate.getMonth() + 1,
							year: futureDate.getFullYear()
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence received date must be in the past</a>'
			);
		});

		it('should send a patch request to the appeal documents endpoint and redirect to the lpa questionnaire page, if complete and valid document details were provided', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-document-details/1`).send({
				items: [
					{
						documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
						receivedDate: {
							day: '1',
							month: '2',
							year: '2023'
						},
						redactionStatus: 2
					}
				]
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/2/add-documents/2864/check-your-answers'
			);
		});
	});

	describe('GET /lpa-questionnaire/2/change-document-name/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/document-redaction-statuses').reply(200, []);
			nock('http://test/').patch(`/appeals/1/documents`).reply(200, []);
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		it(`should render the change document name page for the document being changed`, async () => {
			const response = await request.get(`${baseUrl}/change-document-name/1/1`);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('File name');
			expect(unprettifiedElement.innerHTML).toContain('value="ph0-documentFileInfo">');
		});
	});

	describe('POST /lpa-questionnaire/2/change-document-name/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/document-redaction-statuses').reply(200, []);
			nock('http://test/').patch('/appeals/1/documents/1').reply(200, {});
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		it(`should send a patch request to the appeal documents endpoint and redirect to the manage individual document page, if a new valid document name is provided`, async () => {
			const response = await request
				.post(`${baseUrl}/change-document-name/1/1`)
				.send({ fileName: 'new-name', documentId: '1' });

			expect(response.statusCode).toBe(302);
			expect(response.text).toContain(`Found. Redirecting to ${baseUrl}/manage-documents/1/1`);
		});
	});

	describe('GET /lpa-questionnaire/1/add-documents/:folderId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request.get(`${baseUrl}/add-documents/1/check-your-answers`);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add documents check and confirm page with summary list row displaying info on the uploaded document', async () => {
			const addDocumentsResponse = await request.post(`${baseUrl}/add-documents/1`).send({
				'upload-info': fileUploadInfo
			});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(`${baseUrl}/add-documents/1/check-your-answers`);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
			expect(unprettifiedElement.innerHTML).toContain('File</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt" target="_blank">test-document.txt</a></dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/1/lpa-questionnaire/2/add-documents/${documentFolderInfo.folderId}">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/1/lpa-questionnaire/2/add-document-details/${documentFolderInfo.folderId}">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/1/lpa-questionnaire/2/add-document-details/${documentFolderInfo.folderId}">Change<span class="govuk-visually-hidden"> test-document.txt redaction status</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /lpa-questionnaire/1/add-documents/:folderId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request.post(`${baseUrl}/add-documents/1/check-your-answers`).send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should send an API request to create a new document and redirect to the LPA questionnaire page', async () => {
			const mockDocumentsEndpoint = nock('http://test/').post('/appeals/1/documents').reply(200);

			const addDocumentsResponse = await request.post(`${baseUrl}/add-documents/1`).send({
				'upload-info': fileUploadInfo
			});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/add-documents/1/check-your-answers`).send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/2'
			);

			expect(mockDocumentsEndpoint.isDone()).toBe(true);
		});

		it('should display a "document added" notification banner on the LPA questionnaire page after a document was uploaded', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/').post('/appeals/1/documents').reply(200);

			const addDocumentsResponse = await request.post(`${baseUrl}/add-documents/1`).send({
				'upload-info': fileUploadInfo
			});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const checkYourAnswersResponse = await request
				.post(`${baseUrl}/add-documents/1/check-your-answers`)
				.send({});

			expect(checkYourAnswersResponse.statusCode).toBe(302);

			const response = await request.get(`${baseUrl}`);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: notificationBannerElement,
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain('Success</h3>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence added</p>'
			);
		});
	});

	describe('GET /lpa-questionnaire/1/add-documents/:folderId/:documentId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request.get(`${baseUrl}/add-documents/1/check-your-answers`);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add documents check and confirm page with summary list row displaying info on the uploaded document', async () => {
			const addDocumentsResponse = await request.post(`${baseUrl}/add-documents/1/1`).send({
				'upload-info': fileUploadInfo
			});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(`${baseUrl}/add-documents/1/1/check-your-answers`);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
			expect(unprettifiedElement.innerHTML).toContain('File</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/ph0-documentFileInfo.jpeg/2" target="_blank">test-document.txt</a></dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/1/lpa-questionnaire/2/add-documents/${documentFolderInfo.folderId}/1">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/1/lpa-questionnaire/2/add-document-details/${documentFolderInfo.folderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/1/lpa-questionnaire/2/add-document-details/${documentFolderInfo.folderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt redaction status</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /lpa-questionnaire/1/add-documents/:folderId/:documentId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, lpaqAppealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request
				.post(`${baseUrl}/add-documents/1/1/check-your-answers`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should send an API request to update the document, redirect to the appellant case page, and display a "Document updated" notification banner', async () => {
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome);

			const mockDocumentsEndpoint = nock('http://test/').post('/appeals/1/documents/1').reply(200);

			const addDocumentsResponse = await request.post(`${baseUrl}/add-documents/1/1`).send({
				'upload-info': fileUploadInfo
			});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const checkYourAnswersResponse = await request
				.post(`${baseUrl}/add-documents/1/1/check-your-answers`)
				.send({});

			expect(checkYourAnswersResponse.statusCode).toBe(302);
			expect(checkYourAnswersResponse.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/2'
			);
			expect(mockDocumentsEndpoint.isDone()).toBe(true);

			const lpaqResponse = await request.get(`${baseUrl}`);

			expect(lpaqResponse.statusCode).toBe(200);

			const notificationBannerElementHTML = parseHtml(lpaqResponse.text, {
				rootElement: '.govuk-notification-banner--success'
			}).innerHTML;

			expect(notificationBannerElementHTML).toContain('Success</h3>');
			expect(notificationBannerElementHTML).toContain(
				'Agreement to change description evidence updated</p>'
			);
		});
	});

	describe('GET /lpa-questionnaire/1/manage-documents/:folderId/', () => {
		beforeEach(() => {
			nock.cleanAll();
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 404 error page if the folderId is not valid', async () => {
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);

			const response = await request.get(`${baseUrl}/manage-documents/99/`);

			expect(response.statusCode).toBe(404);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render the manage documents listing page with one document item for each document present in the folder, if the folderId is valid', async () => {
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);

			const response = await request.get(`${baseUrl}/manage-documents/1/`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Changed description documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Name</th>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</th>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</th>');
			expect(unprettifiedElement.innerHTML).toContain('Actions</th>');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFolderInfo.pdf</span>');
			expect(unprettifiedElement.innerHTML).toContain('sample-20s-documentFolderInfo.mp4</span>');
			expect(unprettifiedElement.innerHTML).toContain('ph0-documentFolderInfo.jpeg</span>');
			expect(unprettifiedElement.innerHTML).toContain('ph1-documentFolderInfo.jpeg</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<a href="/appeals-service/appeal-details/1/lpa-questionnaire/2/add-documents/${documentFolderInfo.folderId}" role="button" draggable="false" class="govuk-button" data-module="govuk-button"> Add documents</a>`
			);
		});

		it('should render the manage documents listing page with the expected heading, if the folderId is valid, and the folder is additional documents', async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/manage-documents/2/`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
		});
	});

	describe('GET /lpa-questionnaire/1/manage-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			// @ts-ignore
			usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			// @ts-ignore
			usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo).persist();
		});

		it('should render a 404 error page if the folderId is not valid', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(`${baseUrl}/manage-documents/99/1`);

			expect(response.statusCode).toBe(404);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render a 404 error page if the documentId is not valid', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(`${baseUrl}/manage-documents/1/99`);

			expect(response.statusCode).toBe(404);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is null', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(`${baseUrl}/manage-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Virus scanning</strong>');
			expect(unprettifiedElement.innerHTML).toContain('Version</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Document versions</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Version history</span>');
			expect(unprettifiedElement.innerHTML).toContain('Version</th>');
			expect(unprettifiedElement.innerHTML).toContain('Name</th>');
			expect(unprettifiedElement.innerHTML).toContain('Activity</th>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</th>');
			expect(unprettifiedElement.innerHTML).toContain('Action</th>');
			expect(unprettifiedElement.innerHTML).not.toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'test-pdf-documentFileVersionsInfo.pdf</a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version</a>');
			expect(unprettifiedElement.innerHTML).not.toContain('Remove current version</a>');
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "not_scanned"', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfoNotChecked);

			const response = await request.get(`${baseUrl}/manage-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Virus scanning</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'test-pdf-documentFileVersionsInfo.pdf</a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version</a>');
			expect(unprettifiedElement.innerHTML).not.toContain('Remove current version</a>');
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "affected"', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfoVirusFound);

			const response = await request.get(`${baseUrl}/manage-documents/1/1`);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('class="govuk-error-summary"');
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'The selected file contains a virus. Upload a different version.</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Upload a new version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Remove current version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Virus scanning</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'test-pdf-documentFileVersionsInfo.pdf</a>'
			);
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "scanned"', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfoChecked);

			const response = await request.get(`${baseUrl}/manage-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Upload a new version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Remove current version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain('Virus scanning</strong>');
		});

		it('should render the manage individual document page without late entry tag in the date received row if the latest version of the document is not marked as late entry', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(`${baseUrl}/manage-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).not.toContain('Late entry</strong>');
		});

		it('should render the manage individual document page with late entry tag in the date received row if the latest version of the document is marked as late entry, and a document history item for each version, with late entry tag in the history item document name column for versions marked as late entry', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileMultipleVersionsInfoWithLatestAsLateEntry);

			const response = await request.get(`${baseUrl}/manage-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Late entry</strong>');
		});
	});

	describe('GET /lpa-questionnaire/1/manage-documents/:folderId/:documentId/:versionId/delete', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		it('should render the delete document page with the expected content when there is a single document version', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfoChecked);

			const response = await request.get(`${baseUrl}/manage-documents/1/1/1/delete`);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage versions</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(
				'Are you sure you want to remove this version?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-warning-text__text"><span class="govuk-visually-hidden">Warning</span> Removing the only version of a document will delete the document from the case</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="no">'
			);
		});

		it('should render the delete document page with the expected content when there are multiple document versions', async () => {
			const multipleVersionsDocument = cloneDeep(documentFileVersionsInfoChecked);
			multipleVersionsDocument.allVersions.push(multipleVersionsDocument.allVersions[0]);

			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, multipleVersionsDocument);

			const response = await request.get(`${baseUrl}/manage-documents/1/1/1/delete`);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage versions</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(
				'Are you sure you want to remove this version?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-warning-text__text"><span class="govuk-visually-hidden">Warning</span> Removing the only version of a document will delete the document from the case</strong>'
			);
		});
	});

	describe('GET /lpa-questionnaire/1/environment-service-team-review-case', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/2`)
				.reply(200, lpaQuestionnaireData)
				.persist();
		});

		it('should render the environment service team review required page', async () => {
			const response = await request.get(`${baseUrl}/environment-service-team-review-case`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toContain(
				'Does the environmental services team need to review the case?</h1>'
			);
			expect(element.innerHTML).toMatchSnapshot();
		});
	});

	describe('POST /lpa-questionnaire/1/environment-service-team-review-case', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/1/lpa-questionnaires/2`)
				.reply(200, lpaQuestionnaireData)
				.persist();
		});

		it('should render the environment service team review required page in error', async () => {
			nock('http://test/').patch(`/appeals/1/lpa-questionnaires/2`).reply(200, {});
			const response = await request.post(`${baseUrl}/environment-service-team-review-case`).send();
			const element = parseHtml(response.text);
			expect(element.innerHTML).toContain(
				'Does the environmental services team need to review the case?</h1>'
			);
			expect(element.innerHTML).toContain('There is a problem');
			expect(element.innerHTML).toContain(
				'Select yes if the environmental services team need to review the case'
			);
			expect(element.innerHTML).toMatchSnapshot();
		});

		it('should save the eia-screening-required value and redirect successfully', async () => {
			nock('http://test/').patch(`/appeals/1/eia-screening-required`).reply(200, {});
			nock('http://test/')
				.get('/appeals/1/lpa-questionnaires/2')
				.reply(200, lpaQuestionnaireDataIncompleteOutcome)
				.patch('/appeals/1/lpa-questionnaires/2')
				.reply(200, { validationOutcome: 'complete' });
			const response = await request
				.post(`${baseUrl}/environment-service-team-review-case`)
				.send({ eiaScreeningRequired: 'yes' });

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});
	describe('change LPA link', () => {
		const lpaList = [
			{
				id: 1,
				lpaCode: 'Q1111',
				name: 'System Test Borough Council 2',
				email: 'test@example.com'
			},
			{
				id: 2,
				lpaCode: 'MAID',
				name: 'Maidstone Borough Council',
				email: 'test2@example.com'
			},
			{
				id: 3,
				lpaCode: 'BARN',
				name: 'Barnsley Metropolitan Borough Council',
				email: 'test3@example.com'
			},
			{
				id: 4,
				lpaCode: 'Q9999',
				name: 'System Test Borough Council',
				email: 'test4@example.com'
			}
		];

		beforeEach(() => {
			nock('http://test/').get('/appeals/local-planning-authorities').reply(200, lpaList);
		});
		afterEach(teardown);

		describe('GET /lpa-questionnaire/1/change-appeal-details/local-planning-authority', () => {
			it('should render the local planning authority page', async () => {
				const response = await request.get(
					`${baseUrl}/change-appeal-details/local-planning-authority`
				);
				const element = parseHtml(response.text);

				expect(response.text).toContain(`<a href="${baseUrl}" class="govuk-back-link">Back</a>`);
				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Local planning authority');
				expect(element.innerHTML).not.toContain(lpaList[0].name);
				expect(element.innerHTML).toContain(lpaList[1].name);
				expect(element.innerHTML).toContain(lpaList[2].name);
				expect(element.innerHTML).not.toContain(lpaList[3].name);
				expect(element.innerHTML).not.toContain(`checked`);
				expect(element.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /lpa-questionnaire/1/change-appeal-details/local-planning-authority', () => {
			beforeEach(() => {
				nock('http://test/').post('/appeals/1/lpa').reply(200, { success: true });
			});

			afterEach(() => {
				nock.cleanAll();
			});
			it('should redirect to correct url when lpa field is populated and valid', async () => {
				const response = await request
					.post(`${baseUrl}/change-appeal-details/local-planning-authority`)
					.send({ localPlanningAuthority: 2 });

				expect(response.text).toEqual(`Found. Redirecting to ${baseUrl}`);
				expect(response.statusCode).toBe(302);
			});

			it('should re-render the page with an error message if required field is missing', async () => {
				const response = await request
					.post(`${baseUrl}/change-appeal-details/local-planning-authority`)
					.send({});

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Local planning authority</h1>');

				const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHTML).toContain('Select the local planning authority');
			});
		});
	});
});
