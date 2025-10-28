// @ts-nocheck
import { mapStatusDependentNotifications } from '#lib/mappers/utils/map-status-dependent-notifications.js';
import { appealDataToGetRequiredActions } from '#testing/appeals/appeals.js';

describe('mapStatusDependentNotifications', () => {
	const mockAppealData = {
		appealId: 1
	};
	const testCases = [
		{
			bannerKey: 'appealAwaitingTransfer',
			requiredAction: 'addHorizonReference',
			expectedContainedHtml: `<p class="govuk-notification-banner__heading"><a class="govuk-link" data-cy="awaiting-transfer" href="/appeals-service/appeal-details/${mockAppealData.appealId}/change-appeal-type/add-horizon-reference?backUrl=%2Fappeals-service%2Fappeal-details%2F1">Mark as transferred</a></p>`
		},
		{
			bannerKey: 'readyForSetUpSiteVisit',
			requiredAction: 'arrangeSiteVisit',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">Site visit ready to set up</p>',
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
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
			expectedContainedHtml: '<p class="govuk-notification-banner__heading">Ready for decision</p>',
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'progressFromFinalComments',
			requiredAction: 'progressFromFinalComments',
			expectedContainedHtml: `<a href="/appeals-service/appeal-details/${mockAppealData.appealId}/share?backUrl=%2Fappeals-service%2Fappeal-details%2F${mockAppealData.appealId}" class="govuk-heading-s govuk-notification-banner__link">Progress case</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'progressFromStatements',
			requiredAction: 'progressFromStatements',
			expectedContainedHtml: `<a href="/appeals-service/appeal-details/${mockAppealData.appealId}/share?backUrl=%2Fappeals-service%2Fappeal-details%2F${mockAppealData.appealId}" class="govuk-heading-s govuk-notification-banner__link">Progress to final comments</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
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
				'<p class="govuk-notification-banner__heading">Appellant final comments awaiting review</p>',
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'lpaFinalCommentsAwaitingReview',
			requiredAction: 'reviewLpaFinalComments',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">LPA final comments awaiting review</p>',
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'interestedPartyCommentsAwaitingReview',
			requiredAction: 'reviewIpComments',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">Interested party comments awaiting review</p>',
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
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
				'<p class="govuk-notification-banner__heading">LPA statement awaiting review</p>',
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'shareFinalComments',
			requiredAction: 'shareFinalComments',
			expectedContainedHtml: `<a href="/appeals-service/appeal-details/${mockAppealData.appealId}/share?backUrl=%2Fappeals-service%2Fappeal-details%2F${mockAppealData.appealId}" class="govuk-heading-s govuk-notification-banner__link">Share final comments</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'shareCommentsAndLpaStatement',
			requiredAction: 'shareIpCommentsAndLpaStatement',
			expectedContainedHtml: `<a href="/appeals-service/appeal-details/${mockAppealData.appealId}/share?backUrl=%2Fappeals-service%2Fappeal-details%2F${mockAppealData.appealId}" class="govuk-heading-s govuk-notification-banner__link">Share IP comments and LPA statement</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'appealValidAndReadyToStart',
			requiredAction: 'startAppeal',
			expectedContainedHtml: '<p class="govuk-notification-banner__heading">Appeal valid</p>',
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'awaitingLinkedAppeal',
			requiredAction: 'awaitingLinkedAppeal',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">Awaiting linked appeal</p>'
		},
		{
			bannerKey: 'updateLpaStatement',
			requiredAction: 'updateLpaStatement',
			expectedContainedHtml:
				'<p class="govuk-notification-banner__heading">LPA statement incomplete</p>',
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'addResidencesNetChange',
			requiredAction: 'addResidencesNetChangeS78',
			expectedContainedHtml: `<a class="govuk-link" data-cy="add-residences-net-change" href="/appeals-service/appeal-details/${mockAppealData.appealId}/residential-units/new?backUrl=%2Fappeals-service%2Fappeal-details%2F${mockAppealData.appealId}">Add number of residential units</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'addResidencesNetChange',
			requiredAction: 'addResidencesNetChangeS20',
			expectedContainedHtml: `<a class="govuk-link" data-cy="add-residences-net-change" href="/appeals-service/appeal-details/${mockAppealData.appealId}/residential-units/new?backUrl=%2Fappeals-service%2Fappeal-details%2F${mockAppealData.appealId}">Add number of residential units</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'reviewLpaProofOfEvidence',
			requiredAction: 'reviewLpaProofOfEvidenceComplete',
			expectedContainedHtml: `<a class="govuk-link" data-cy="review-lpa-proof-of-evidence" href="/appeals-service/appeal-details/${mockAppealData.appealId}/proof-of-evidence/lpa?backUrl=%2Fappeals-service%2Fappeal-details%2F1">Review LPA proof of evidence and witnesses</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'reviewAppellantProofOfEvidence',
			requiredAction: 'reviewAppellantProofOfEvidenceComplete',
			expectedContainedHtml: `<a class="govuk-link" data-cy="review-appellant-proof-of-evidence" href="/appeals-service/appeal-details/${mockAppealData.appealId}/proof-of-evidence/appellant?backUrl=%2Fappeals-service%2Fappeal-details%2F1">Review appellant proof of evidence and witnesses</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'reviewLpaProofOfEvidence',
			requiredAction: 'reviewLpaProofOfEvidenceIncomplete',
			expectedContainedHtml: `<a class="govuk-link" data-cy="review-lpa-proof-of-evidence" href="/appeals-service/appeal-details/${mockAppealData.appealId}/proof-of-evidence/lpa?backUrl=%2Fappeals-service%2Fappeal-details%2F1">Review LPA proof of evidence and witnesses</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'reviewAppellantProofOfEvidence',
			requiredAction: 'reviewAppellantProofOfEvidenceIncomplete',
			expectedContainedHtml: `<a class="govuk-link" data-cy="review-appellant-proof-of-evidence" href="/appeals-service/appeal-details/${mockAppealData.appealId}/proof-of-evidence/appellant?backUrl=%2Fappeals-service%2Fappeal-details%2F1">Review appellant proof of evidence and witnesses</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'progressToProofOfEvidenceAndWitnesses',
			requiredAction: 'progressToProofOfEvidenceAndWitnessesComplete',
			expectedContainedHtml: `<a href="/appeals-service/appeal-details/${mockAppealData.appealId}/share?backUrl=%2Fappeals-service%2Fappeal-details%2F1" class="govuk-heading-s govuk-notification-banner__link">Progress to proof of evidence and witnesses</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'progressToInquiry',
			requiredAction: 'progressToInquiry',
			expectedContainedHtml: `<a href="/appeals-service/appeal-details/${mockAppealData.appealId}/share?backUrl=%2Fappeals-service%2Fappeal-details%2F1" class="govuk-heading-s govuk-notification-banner__link">Progress to inquiry</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: true
		},
		{
			bannerKey: 'setupInquiry',
			requiredAction: 'setupInquiry',
			expectedContainedHtml: `<a class="govuk-link" data-cy="setup-inquiry" href="/appeals-service/appeal-details/${mockAppealData.appealId}/inquiry/setup/date?backUrl=%2Fappeals-service%2Fappeal-details%2F1">Set up inquiry</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: false
		},
		{
			bannerKey: 'addInquiryAddress',
			requiredAction: 'addInquiryAddress',
			expectedContainedHtml: `<a class="govuk-link" data-cy="add-inquiry-address" href="/appeals-service/appeal-details/${mockAppealData.appealId}/inquiry/change/address-details?backUrl=%2Fappeals-service%2Fappeal-details%2F1">Add inquiry address</a>`,
			bannerShouldNotDisplayWhenChildLinkedAppeal: false
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

	for (const testCase of testCases.filter(
		(testCase) => !testCase.bannerShouldNotDisplayWhenChildLinkedAppeal
	)) {
		it(`should return "${testCase.bannerKey}" banner when getRequiredActionsForAppeal returns "${testCase.requiredAction} when the appeal is a child linked appeal"`, async () => {
			const result = mapStatusDependentNotifications(
				{ ...appealDataToGetRequiredActions[testCase.requiredAction], isChildAppeal: true },
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

	for (const testCase of testCases.filter(
		(testCase) => testCase.bannerShouldNotDisplayWhenChildLinkedAppeal
	)) {
		it(`should not return "${testCase.bannerKey}" banner when getRequiredActionsForAppeal returns "${testCase.requiredAction} when the appeal is a child linked appeal"`, async () => {
			const result = mapStatusDependentNotifications(
				{ ...appealDataToGetRequiredActions[testCase.requiredAction], isChildAppeal: true },
				{
					originalUrl: `/appeals-service/appeal-details/${mockAppealData.appealId}`
				}
			);

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});
	}
});
