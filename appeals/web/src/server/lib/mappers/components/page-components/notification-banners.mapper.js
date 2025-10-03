import { isFeatureActive } from '#common/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
/**
 * @typedef {import('#appeals/appeal.constants.js').ServicePageName} ServicePageName
 */

/** @typedef {'awaitingLinkedAppeal'|'allocationDetailsUpdated'|'allocationDetailsAdded'|'appealAwaitingTransfer'|'appealAwaitingTransferOld'|'appealLinked'|'appealTypeChanged'|'appealTypeUpdated'|'appealUnlinked'|'appealValidAndReadyToStart'|'appealWithdrawn'|'appellantCaseInvalidOrIncomplete'|'appellantCaseNotValid'|'appellantFinalCommentsAcceptSuccess'|'appellantFinalCommentsAwaitingReview'|'assignCaseOfficer'|'caseOfficerAdded'|'caseOfficerRemoved'|'caseProgressed'|'caseStarted'|'changePage'|'commentsAndLpaStatementShared'|'costsDocumentAdded'|'documentAdded'|'documentDeleted'|'documentDetailsUpdated'|'documentFilenameUpdated'|'documentVersionAdded'|'finalCommentsAppellantRejectionSuccess'|'finalCommentsDocumentAddedSuccess'|'finalCommentsLPARejectionSuccess'|'finalCommentsRedactionSuccess'|'finalCommentsShared'|'appealMarkedAsAwaitingTransfer'|'appealMarkedAsTransferred'|'appealTypeUpdated'|'horizonReferenceAdded'|'inspectorAdded'|'inspectorRemoved'|'interestedPartyCommentAdded'|'interestedPartyCommentsAddressAddedSuccess'|'interestedPartyCommentsAddressUpdatedSuccess'|'interestedPartyCommentsAwaitingReview'|'interestedPartyCommentsDocumentAddedSuccess'|'interestedPartyCommentsRedactionSuccess'|'interestedPartyCommentsRejectedSuccess'|'interestedPartyCommentsValidSuccess'|'internalCorrespondenceDocumentAdded'|'issuedDecisionInvalid'|'issuedDecisionValid'|'lpaCostsDecisionIssued'|'appellantCostsDecisionIssued'|'lpaFinalCommentsAcceptSuccess'|'lpaFinalCommentsAwaitingReview'|'lpaqReviewComplete'|'lpaqReviewIncomplete'|'lpaQuestionnaireNotValid'|'lpaStatementAccepted'|'lpaStatementAwaitingReview'|'lpaStatementDocumentAddedSuccess'|'lpaStatementIncomplete'|'lpaStatementRedactedAndAccepted'|'neighbouringSiteAdded'|'neighbouringSiteAffected'|'neighbouringSiteRemoved'|'neighbouringSiteUpdated'|'notCheckedDocument'|'progressedToFinalComments'|'progressFromFinalComments'|  'progressHearingCaseWithNoRepsFromStatements'| 'progressedToHearingReadyToSetUp' | 'progressHearingCaseWithNoRepsAndHearingSetUpFromStatements' | 'progressedToAwaitingHearing' |'progressFromStatements'|'readyForDecision'|'issueAppellantCostsDecision'|'issueLpaCostsDecision'|'readyForLpaQuestionnaireReview'|'readyForSetUpSiteVisit'|'readyForValidation'|'relatedAppeal'|'shareCommentsAndLpaStatement'|'shareFinalComments'|'siteAddressUpdated'|'siteVisitChangedDefault'|'siteVisitNoChanges'|'siteVisitRescheduled'|'siteVisitScheduled'|'siteVisitTypeChanged'|'startDateChanged'|'timetableDueDateUpdated'|'updateLpaStatement'|'lpaChanged'|'hearingEstimatesAdded'|'hearingEstimatesChanged'|'hearingSetUp'|'hearingUpdated'|'hearingCancelled'|'timetableStarted'|'addHearingAddress'|'setupHearing'|'linkedAppealAdded'|'decisionLetterUpdated'|'caseOfficerAssigned'|'inspectorAssigned'|'appealValidated'|'inquiryEstimatesAdded'|'inquiryEstimatesChanged'|'netResidenceAdded'|'inquiryUpdated'|'addResidencesNetChange'|'appellantProofOfEvidenceAcceptSuccess'|'lpaProofOfEvidenceAcceptSuccess'|'caseTeamUpdated'|'appellantProofOfEvidenceDocumentAddedSuccess'|'lpaProofOfEvidenceDocumentAddedSuccess'|'lpaProofOfEvidenceIncomplete'|'appellantProofOfEvidenceIncomplete'|'reviewLpaProofOfEvidence'|'reviewAppellantProofOfEvidence'|'siteVisitCancelled'} NotificationBannerDefinitionKey */

/**
 * @typedef {Object} NotificationBannerDefinition
 * @property {'success'|'important'} type
 * @property {ServicePageName[]} pages
 * @property {string} [text]
 * @property {string} [html]
 */

/**
 * @type {Object<NotificationBannerDefinitionKey, NotificationBannerDefinition>}
 */
export const notificationBannerDefinitions = {
	siteVisitScheduled: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Site visit set up'
	},
	siteVisitRescheduled: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Site visit rescheduled'
	},
	siteVisitTypeChanged: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Site visit type changed'
	},
	siteVisitNoChanges: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'No changes made'
	},
	siteVisitChangedDefault: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Site visit updated'
	},
	siteVisitCancelled: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Site visit cancelled'
	},
	allocationDetailsUpdated: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Allocation level updated'
	},
	allocationDetailsAdded: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Allocation level added'
	},
	caseOfficerAdded: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Case officer has been assigned'
	},
	inspectorAdded: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Inspector has been assigned'
	},
	caseOfficerRemoved: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Case officer has been removed'
	},
	inspectorRemoved: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Inspector has been removed'
	},
	documentAdded: {
		type: 'success',
		pages: [
			'appealDetails',
			'appellantCase',
			'lpaQuestionnaire',
			'manageDocuments',
			'viewFinalComments'
		],
		text: 'Document added'
	},
	documentVersionAdded: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire', 'manageDocuments'],
		text: 'Document updated'
	},
	documentDetailsUpdated: {
		type: 'success',
		pages: ['appellantCase', 'lpaQuestionnaire', 'manageDocuments'],
		text: 'Document details updated'
	},
	documentFilenameUpdated: {
		type: 'success',
		pages: ['appellantCase', 'lpaQuestionnaire', 'manageDocuments'],
		text: 'Document filename updated'
	},
	documentDeleted: {
		type: 'success',
		pages: [
			'appealDetails',
			'appellantCase',
			'lpaQuestionnaire',
			'lpaStatement',
			'viewFinalComments',
			'viewIpComment'
		],
		text: 'Document removed'
	},
	appellantCaseNotValid: {
		type: 'important',
		pages: ['appellantCase']
	},
	readyForDecision: {
		type: 'important',
		pages: ['appealDetails']
	},
	issueAppellantCostsDecision: {
		type: 'important',
		pages: ['appealDetails']
	},
	issueLpaCostsDecision: {
		type: 'important',
		pages: ['appealDetails']
	},
	readyForValidation: {
		type: 'important',
		pages: ['appealDetails']
	},
	readyForSetUpSiteVisit: {
		type: 'important',
		pages: ['appealDetails']
	},
	readyForLpaQuestionnaireReview: {
		type: 'important',
		pages: ['appealDetails']
	},
	progressFromStatements: {
		type: 'important',
		pages: ['appealDetails']
	},
	progressHearingCaseWithNoRepsFromStatements: {
		type: 'important',
		pages: ['appealDetails']
	},
	progressHearingCaseWithNoRepsAndHearingSetUpFromStatements: {
		type: 'important',
		pages: ['appealDetails']
	},
	lpaQuestionnaireNotValid: {
		type: 'important',
		pages: ['lpaQuestionnaire']
	},
	notCheckedDocument: {
		type: 'important',
		pages: ['lpaQuestionnaire', 'manageDocuments', 'appellantCase', 'manageFolder'],
		html: '<p class="govuk-notification-banner__heading">Virus scan in progress</p></br><a class="govuk-notification-banner__link" href="" data-cy="refresh-page" >Refresh page to see if scan has finished</a>'
	},
	awaitingLinkedAppeal: {
		type: 'important',
		pages: ['appealDetails']
	},
	appealAwaitingTransfer: {
		type: 'important',
		pages: ['appealDetails'],
		html: '<p class="govuk-notification-banner__heading">Mark as transferred.</p>'
	},
	appealAwaitingTransferOld: {
		type: 'important',
		pages: ['appealDetails'],
		html: '<p class="govuk-notification-banner__heading">This appeal is awaiting transfer</p><p class="govuk-body">The appeal must be transferred to Horizon. When this is done, update the appeal with the new horizon reference.</p>'
	},
	appealMarkedAsAwaitingTransfer: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appeal marked as awaiting transfer'
	},
	appealMarkedAsTransferred: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire'],
		text: 'Appeal marked as transferred'
	},
	appealTypeUpdated: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appeal type updated'
	},
	horizonReferenceAdded: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire'],
		text: 'Horizon reference added'
	},
	assignCaseOfficer: {
		type: 'important',
		pages: ['appealDetails']
	},
	appealLinked: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire'],
		text: 'Appeals linked'
	},
	appealUnlinked: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire'],
		text: 'Appeals unlinked'
	},
	relatedAppeal: {
		type: 'success',
		pages: ['appealDetails', 'manageRelatedAppeals', 'appellantCase', 'lpaQuestionnaire'],
		text: 'Appeal relationship updated'
	},
	neighbouringSiteAdded: {
		type: 'success',
		pages: ['appealDetails', 'lpaQuestionnaire'],
		text: 'Address added'
	},
	neighbouringSiteUpdated: {
		type: 'success',
		pages: ['appealDetails', 'lpaQuestionnaire'],
		text: 'Address updated'
	},
	neighbouringSiteRemoved: {
		type: 'success',
		pages: ['appealDetails', 'lpaQuestionnaire', 'manageNeighbouringSites'],
		text: 'Address removed'
	},
	appealValidAndReadyToStart: {
		type: 'important',
		pages: ['appealDetails']
	},
	costsDocumentAdded: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Costs document uploaded'
	},
	internalCorrespondenceDocumentAdded: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Internal correspondence document uploaded'
	},
	neighbouringSiteAffected: {
		type: 'success',
		pages: ['appealDetails', 'lpaQuestionnaire'],
		text: 'Neighbouring site affected status updated'
	},
	siteAddressUpdated: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase'],
		text: 'Site address updated'
	},
	timetableDueDateUpdated: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Timetable due dates updated'
	},
	changePage: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire', 'ipComments']
	},
	lpaStatementAwaitingReview: {
		type: 'important',
		pages: ['appealDetails']
	},
	interestedPartyCommentsAwaitingReview: {
		type: 'important',
		pages: ['appealDetails']
	},
	interestedPartyCommentsValidSuccess: {
		type: 'success',
		pages: ['ipComments'],
		text: 'Comment accepted'
	},
	interestedPartyCommentsRejectedSuccess: {
		type: 'success',
		pages: ['ipComments'],
		text: 'Comment rejected'
	},
	interestedPartyCommentsRedactionSuccess: {
		type: 'success',
		pages: ['ipComments'],
		text: 'Comment redacted and accepted'
	},
	interestedPartyCommentAdded: {
		type: 'success',
		pages: ['viewIpComment', 'ipComments'],
		text: 'Interested party comment added'
	},
	interestedPartyCommentsAddressAddedSuccess: {
		type: 'success',
		pages: ['viewIpComment', 'reviewIpComment'],
		text: 'Interested party address added'
	},
	interestedPartyCommentsAddressUpdatedSuccess: {
		type: 'success',
		pages: ['viewIpComment', 'reviewIpComment'],
		text: 'Interested party address changed'
	},
	interestedPartyCommentsDocumentAddedSuccess: {
		type: 'success',
		pages: ['viewIpComment', 'reviewIpComment'],
		text: 'Supporting document added'
	},
	appellantFinalCommentsAwaitingReview: {
		type: 'important',
		pages: ['appealDetails']
	},
	lpaFinalCommentsAwaitingReview: {
		type: 'important',
		pages: ['appealDetails']
	},
	finalCommentsRedactionSuccess: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Final comments redacted and accepted'
	},
	finalCommentsLPARejectionSuccess: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'LPA final comments rejected'
	},
	finalCommentsAppellantRejectionSuccess: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appellant final comments rejected'
	},
	lpaStatementAccepted: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'LPA statement accepted'
	},
	lpaStatementRedactedAndAccepted: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'LPA statement redacted and accepted'
	},
	lpaStatementDocumentAddedSuccess: {
		type: 'success',
		pages: ['lpaStatement'],
		text: 'Supporting document added'
	},
	appellantProofOfEvidenceDocumentAddedSuccess: {
		type: 'success',
		pages: ['viewProofOfEvidence'],
		text: 'Appellant proof of evidence and witnesses added'
	},
	lpaProofOfEvidenceDocumentAddedSuccess: {
		type: 'success',
		pages: ['viewProofOfEvidence'],
		text: 'LPA proof of evidence and witnesses added'
	},
	updateLpaStatement: {
		type: 'important',
		pages: ['appealDetails']
	},
	lpaStatementIncomplete: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Statement incomplete'
	},
	shareCommentsAndLpaStatement: {
		type: 'important',
		pages: ['appealDetails']
	},
	shareFinalComments: {
		type: 'important',
		pages: ['appealDetails']
	},
	progressFromFinalComments: {
		type: 'important',
		pages: ['appealDetails']
	},
	commentsAndLpaStatementShared: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Statements and IP comments shared'
	},
	progressedToFinalComments: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Progressed to final comments'
	},
	progressedToHearingReadyToSetUp: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Progressed to hearing ready to set up'
	},
	finalCommentsShared: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Final comments shared'
	},
	caseProgressed: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Case progressed'
	},
	finalCommentsDocumentAddedSuccess: {
		type: 'success',
		pages: ['viewFinalComments'],
		text: 'Supporting document added'
	},
	appellantFinalCommentsAcceptSuccess: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appellant final comments accepted'
	},
	lpaFinalCommentsAcceptSuccess: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'LPA final comments accepted'
	},
	lpaqReviewComplete: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'LPA questionnaire complete'
	},
	lpaqReviewIncomplete: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'LPA questionnaire incomplete'
	},
	appealWithdrawn: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appeal withdrawn'
	},
	appellantCaseInvalidOrIncomplete: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appellant case invalid or incomplete'
	},
	appealTypeChanged: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appeal closed'
	},
	caseStarted: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appeal started'
	},
	startDateChanged: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Start date changed'
	},
	issuedDecisionValid: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Decision issued'
	},
	issuedDecisionInvalid: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appeal marked as invalid'
	},
	lpaCostsDecisionIssued: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'LPA costs decision issued'
	},
	appellantCostsDecisionIssued: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appellant costs decision issued'
	},
	lpaChanged: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire'],
		text: 'LPA updated'
	},
	hearingEstimatesAdded: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Hearing estimates added'
	},
	hearingEstimatesChanged: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Hearing estimates updated'
	},
	hearingSetUp: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Hearing set up'
	},
	hearingUpdated: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Hearing updated'
	},
	timetableStarted: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Timetable started'
	},
	addHearingAddress: {
		type: 'important',
		pages: ['appealDetails']
	},
	hearingCancelled: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Hearing cancelled'
	},
	setupHearing: {
		type: 'important',
		pages: ['appealDetails']
	},
	linkedAppealAdded: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Linked appeal added'
	},
	decisionLetterUpdated: {
		type: 'success',
		pages: ['appealDecision'],
		text: 'Decision letter updated'
	},
	caseOfficerAssigned: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Case officer assigned'
	},
	inspectorAssigned: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Inspector assigned'
	},
	appealValidated: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appeal validated'
	},
	inquiryEstimatesAdded: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Inquiry estimates added'
	},
	inquiryEstimatesChanged: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Inquiry estimates changed'
	},
	netResidenceAdded: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Number of residential units added'
	},
	addResidencesNetChange: {
		type: 'important',
		pages: ['appealDetails']
	},
	inquiryUpdated: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Inquiry updated'
	},
	appellantProofOfEvidenceAcceptSuccess: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appellant proof of evidence and witnesses accepted'
	},
	lpaProofOfEvidenceAcceptSuccess: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'LPA proof of evidence and witnesses accepted'
	},
	caseTeamUpdated: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Case team updated'
	},
	progressedToAwaitingHearing: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Progressed to awaiting hearing'
	},
	lpaProofOfEvidenceIncomplete: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'LPA proof of evidence incomplete'
	},
	appellantProofOfEvidenceIncomplete: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Appellant proof of evidence incomplete'
	},
	reviewLpaProofOfEvidence: {
		type: 'important',
		pages: ['appealDetails']
	},
	reviewAppellantProofOfEvidence: {
		type: 'important',
		pages: ['appealDetails']
	}
};

/** @type {Object<import('#lib/mappers/utils/required-actions.js').AppealRequiredAction, NotificationBannerDefinitionKey>} */
const appealActionRequiredToNotificationBannerMapping = {
	addHorizonReference: isFeatureActive(FEATURE_FLAG_NAMES.CHANGE_APPEAL_TYPE)
		? 'appealAwaitingTransfer'
		: 'appealAwaitingTransferOld',
	arrangeSiteVisit: 'readyForSetUpSiteVisit',
	assignCaseOfficer: 'assignCaseOfficer',
	issueDecision: 'readyForDecision',
	issueAppellantCostsDecision: 'issueAppellantCostsDecision',
	issueLpaCostsDecision: 'issueLpaCostsDecision',
	progressFromFinalComments: 'progressFromFinalComments',
	progressFromStatements: 'progressFromStatements',
	progressHearingCaseWithNoRepsFromStatements: 'progressHearingCaseWithNoRepsFromStatements',
	progressHearingCaseWithNoRepsAndHearingSetUpFromStatements:
		'progressHearingCaseWithNoRepsAndHearingSetUpFromStatements',
	reviewAppellantCase: 'readyForValidation',
	awaitingAppellantUpdate: 'readyForValidation',
	awaitingLinkedAppeal: 'awaitingLinkedAppeal',
	reviewAppellantFinalComments: 'appellantFinalCommentsAwaitingReview',
	reviewIpComments: 'interestedPartyCommentsAwaitingReview',
	reviewLpaFinalComments: 'lpaFinalCommentsAwaitingReview',
	reviewLpaQuestionnaire: 'readyForLpaQuestionnaireReview',
	awaitingLpaUpdate: 'readyForLpaQuestionnaireReview',
	reviewLpaStatement: 'lpaStatementAwaitingReview',
	shareFinalComments: 'shareFinalComments',
	shareIpCommentsAndLpaStatement: 'shareCommentsAndLpaStatement',
	startAppeal: 'appealValidAndReadyToStart',
	updateLpaStatement: 'updateLpaStatement',
	addHearingAddress: 'addHearingAddress',
	setupHearing: 'setupHearing',
	linkedAppealAdded: 'linkedAppealAdded',
	decisionLetterUpdated: 'decisionLetterUpdated',
	addResidencesNetChange: 'addResidencesNetChange',
	reviewLpaProofOfEvidence: 'reviewLpaProofOfEvidence',
	reviewAppellantProofOfEvidence: 'reviewAppellantProofOfEvidence'
};

/**
 *
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {ServicePageName} servicePage
 * @param {number} appealId
 * @returns {PageComponent[]}
 */
export function mapNotificationBannersFromSession(session, servicePage, appealId) {
	const appealIdAsString = typeof appealId === 'number' ? appealId.toString() : appealId;

	if (!('notificationBanners' in session) || !(appealIdAsString in session.notificationBanners)) {
		return [];
	}

	/** @type {NotificationBannerDefinitionKey[]} */
	const displayedBannerKeys = [];

	/**
	 * @type {PageComponent[]}
	 */
	const notificationBanners = session.notificationBanners[appealIdAsString].flatMap(
		(
			/** @type {import('#lib/session-utilities.js').NotificationBannerSessionData} */ bannerData
		) => {
			if (!Object.keys(notificationBannerDefinitions).includes(bannerData.key)) {
				return [];
			}

			const bannerDefinition = notificationBannerDefinitions[bannerData.key];

			if (!bannerDefinition.pages.includes(servicePage)) {
				return [];
			}

			const bannerText = bannerData?.text || bannerDefinition.text;
			const bannerHtml = bannerData?.html || bannerDefinition.html;

			displayedBannerKeys.push(bannerData.key);

			return [
				createNotificationBanner({
					bannerDefinitionKey: bannerData.key,
					...(bannerText && {
						text: bannerText
					}),
					...(bannerHtml && {
						html: bannerHtml
					})
				})
			];
		}
	);

	session.notificationBanners[appealIdAsString] = session.notificationBanners[
		appealIdAsString
	].filter(
		(/** @type {import('#lib/session-utilities.js').NotificationBannerSessionData} */ bannerData) =>
			!displayedBannerKeys.includes(bannerData.key)
	);

	return sortNotificationBanners(notificationBanners);
}

/**
 * @param {Object} options
 * @param {NotificationBannerDefinitionKey} options.bannerDefinitionKey
 * @param {string} [options.titleText]
 * @param {string} [options.text]
 * @param {string} [options.html]
 * @param {PageComponent[]} [options.pageComponents]
 * @returns {PageComponent}
 */
export function createNotificationBanner({
	bannerDefinitionKey,
	titleText,
	text,
	html,
	pageComponents
}) {
	const bannerDefinition = notificationBannerDefinitions[bannerDefinitionKey];

	return {
		type: 'notification-banner',
		parameters: {
			titleText:
				titleText ||
				('type' in bannerDefinition && bannerDefinition.type === 'success'
					? 'Success'
					: 'Important'),
			titleHeadingLevel: 3,
			...('type' in bannerDefinition && {
				type: bannerDefinition.type
			}),
			text: text || bannerDefinition.text,
			html: html || bannerDefinition.html,
			...(pageComponents && {
				html: '',
				pageComponents: pageComponents
			})
		}
	};
}

/**
 * @param {import('#lib/mappers/utils/required-actions.js').AppealRequiredAction} requiredAction
 * @returns {NotificationBannerDefinitionKey|undefined}
 */
export function mapRequiredActionToNotificationBannerKey(requiredAction) {
	if (!(requiredAction in appealActionRequiredToNotificationBannerMapping)) {
		return;
	}

	return appealActionRequiredToNotificationBannerMapping[requiredAction];
}

/**
 * @param {PageComponent[]} bannerComponents
 * @returns {PageComponent[]}
 */
export function sortNotificationBanners(bannerComponents) {
	const sortedBanners = bannerComponents.sort((a, b) => {
		if (a.parameters.type === 'success' && b.parameters.type === 'important') {
			return -1;
		} else if (a.parameters.type === 'important' && b.parameters.type === 'success') {
			return 1;
		}
		return 0;
	});

	sortedBanners.forEach(
		(bannerComponent, index) => (bannerComponent.parameters.attributes = { 'data-index': index })
	);

	return sortedBanners;
}
