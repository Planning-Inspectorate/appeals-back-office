// @ts-nocheck
import { appealDataToGetRequiredActions } from '#testing/appeals/appeals.js';
import { mapStatusDependentNotifications } from '#lib/mappers/utils/map-status-dependent-notifications.js';

describe('mapStatusDependentNotifications', () => {
	const mockAppealData = {
		appealId: 1
	};
	const testCases = [
		{
			bannerKey: 'appealAwaitingTransfer',
			requiredAction: 'addHorizonReference',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">This appeal is awaiting transfer</p>'
		},
		{
			bannerKey: 'readyForSetUpSiteVisit',
			requiredAction: 'arrangeSiteVisit',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">Site visit ready to set up</p>'
		},
		{
			bannerKey: 'assignCaseOfficer',
			requiredAction: 'assignCaseOfficer',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">Appeal ready to be assigned to case officer</p>'
		},
		{
			bannerKey: 'readyForDecision',
			requiredAction: 'issueDecision',
			expectedContainedHtml: '<p class="govuk-notification-banner__heading">Ready for decision</p>'
		},
		{
			bannerKey: 'progressFromFinalComments',
			requiredAction: 'progressFromFinalComments',
			expectedContainedHtml: `<a href="/appeals-service/appeal-details/${mockAppealData.appealId}/share?backUrl=%2Fappeals-service%2Fappeal-details%2F${mockAppealData.appealId}" class="govuk-heading-s govuk-notification-banner__link">Progress case</a>`
		},
		{
			bannerKey: 'progressFromStatements',
			requiredAction: 'progressFromStatements',
			expectedContainedHtml: `<a href="/appeals-service/appeal-details/${mockAppealData.appealId}/share?backUrl=%2Fappeals-service%2Fappeal-details%2F${mockAppealData.appealId}" class="govuk-heading-s govuk-notification-banner__link">Progress to final comments</a>`
		},
		{
			bannerKey: 'readyForValidation',
			requiredAction: 'reviewAppellantCase',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">Appeal ready for validation</p>'
		},
		{
			bannerKey: 'readyForValidation',
			requiredAction: 'awaitingAppellantUpdate',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">Appeal ready for validation</p>'
		},
		{
			bannerKey: 'appellantFinalCommentsAwaitingReview',
			requiredAction: 'reviewAppellantFinalComments',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">Appellant final comments awaiting review</p>'
		},
		{
			bannerKey: 'lpaFinalCommentsAwaitingReview',
			requiredAction: 'reviewLpaFinalComments',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">LPA final comments awaiting review</p>'
		},
		{
			bannerKey: 'interestedPartyCommentsAwaitingReview',
			requiredAction: 'reviewIpComments',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">Interested party comments awaiting review</p>'
		},
		{
			bannerKey: 'readyForLpaQuestionnaireReview',
			requiredAction: 'reviewLpaQuestionnaire',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">LPA questionnaire ready for review</p>'
		},
		{
			bannerKey: 'readyForLpaQuestionnaireReview',
			requiredAction: 'awaitingLpaUpdate',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">LPA questionnaire ready for review</p>'
		},
		{
			bannerKey: 'lpaStatementAwaitingReview',
			requiredAction: 'reviewLpaStatement',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">LPA statement awaiting review</p>'
		},
		{
			bannerKey: 'shareFinalComments',
			requiredAction: 'shareFinalComments',
			expectedContainedHtml: `<a href="/appeals-service/appeal-details/${mockAppealData.appealId}/share?backUrl=%2Fappeals-service%2Fappeal-details%2F${mockAppealData.appealId}" class="govuk-heading-s govuk-notification-banner__link">Share final comments</a>`
		},
		{
			bannerKey: 'shareCommentsAndLpaStatement',
			requiredAction: 'shareIpCommentsAndLpaStatement',
			expectedContainedHtml: `<a href="/appeals-service/appeal-details/${mockAppealData.appealId}/share?backUrl=%2Fappeals-service%2Fappeal-details%2F${mockAppealData.appealId}" class="govuk-heading-s govuk-notification-banner__link">Share IP comments and LPA statement</a>`
		},
		{
			bannerKey: 'appealValidAndReadyToStart',
			requiredAction: 'startAppeal',
			expectedContainedHtml: '<p class="govuk-notification-banner__heading">Appeal valid</p>'
		},
		{
			bannerKey: 'updateLpaStatement',
			requiredAction: 'updateLpaStatement',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">LPA statement incomplete</p>'
		},
		{
			bannerKey: 'addResidencesNetChange',
			requiredAction: 'addResidencesNetChange',
			expectedContainedHtml: `<a class="govuk-link" data-cy="add-residences-net-change" href="/appeals-service/appeal-details/${mockAppealData.appealId}/residential-units/new?backUrl=%2Fappeals-service%2Fappeal-details%2F${mockAppealData.appealId}">Add number of residential units</a>`
		}
	];

	for (const testCase of testCases) {
		it(`should return "${testCase.bannerKey}" banner when getRequiredActionsForAppeal returns "${testCase.requiredAction}"`, async () => {
			const result = mapStatusDependentNotifications(
				appealDataToGetRequiredActions[testCase.requiredAction],
				{
					originalUrl: `/appeals-service/appeal-details/${mockAppealData.appealId}`
				}
			);

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].type).toBe('notification-banner');
			expect(result[0].parameters.type).toBe('important');
			expect(result[0].parameters.html).toContain(testCase.expectedContainedHtml);
		});
	}
});
