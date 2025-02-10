/**
 * @typedef {import('#appeals/appeal.constants.js').ServicePageName} ServicePageName
 */

/** @typedef {'siteVisitTypeSelected'|'siteVisitArranged'|'allocationDetailsUpdated'|'caseOfficerAdded'|'inspectorAdded'|'caseOfficerRemoved'|'inspectorRemoved'|'documentAdded'|'documentVersionAdded'|'documentDetailsUpdated'|'documentFilenameUpdated'|'documentDeleted'|'appellantCaseNotValid'|'readyForDecision'|'readyForValidation'|'readyForSetUpSiteVisit'|'readyForLpaQuestionnaireReview'|'progressToFinalComments'|'lpaQuestionnaireNotValid'|'notCheckedDocument'|'appealAwaitingTransfer'|'horizonReferenceAdded'|'assignCaseOfficer'|'appealLinked'|'appealUnlinked'|'otherAppeal'|'otherAppealRemoved'|'neighbouringSiteAdded'|'neighbouringSiteUpdated'|'neighbouringSiteRemoved'|'appealValidAndReadyToStart'|'costsDocumentAdded'|'internalCorrespondenceDocumentAdded'|'serviceUserUpdated'|'lpaReferenceUpdated'|'inspectorAccessUpdated'|'neighbouringSiteAffected'|'siteAddressUpdated'|'isAppealTypeCorrectUpdated'|'lpaqDueDateUpdated'|'timetableDueDateUpdated'|'changePage'|'lpaStatementAwaitingReview'|'interestedPartyCommentsAwaitingReview'|'interestedPartyCommentsValidSuccess'|'interestedPartyCommentsRejectedSuccess'|'interestedPartyCommentsRedactionSuccess'|'interestedPartyCommentsAddressAddedSuccess'|'interestedPartyCommentsAddressUpdatedSuccess'|'interestedPartyCommentsDocumentAddedSuccess'|'appellantFinalCommentsAwaitingReview'|'lpaFinalCommentsAwaitingReview'|'finalCommentsRedactionSuccess'|'finalCommentsLPARejectionSuccess'|'finalCommentsAppellantRejectionSuccess'|'lpaStatementAccepted'|'lpaStatementRedactedAndAccepted'|'shareCommentsAndLpaStatement'|'finalCommentsDocumentAddedSuccess'|'finalCommentsAcceptSuccess'} NotificationBannerDefinitionKey  */

/**
 * @typedef {Object} NotificationBannerDefinition
 * @property {ServicePageName[]} pages
 * @property {'success'} [type] default is 'important'
 * @property {string} [text]
 * @property {string} [html]
 */

/**
 * @type {Object<NotificationBannerDefinitionKey, NotificationBannerDefinition>}
 */
export const notificationBannerDefinitions = {
	siteVisitTypeSelected: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Site visit type has been selected'
	},
	siteVisitArranged: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Site visit has been arranged'
	},
	allocationDetailsUpdated: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Allocation details added'
	},
	caseOfficerAdded: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Case officer has been assigned'
	},
	inspectorAdded: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Inspector has been assigned'
	},
	caseOfficerRemoved: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Case officer has been removed'
	},
	inspectorRemoved: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Inspector has been removed'
	},
	documentAdded: {
		pages: ['appellantCase', 'lpaQuestionnaire', 'manageDocuments', 'viewFinalComments'],
		type: 'success',
		text: 'Document added'
	},
	documentVersionAdded: {
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire', 'manageDocuments'],
		type: 'success',
		text: 'Document updated'
	},
	documentDetailsUpdated: {
		pages: ['appellantCase', 'lpaQuestionnaire', 'manageDocuments'],
		type: 'success',
		text: 'Document details updated'
	},
	documentFilenameUpdated: {
		pages: ['appellantCase', 'lpaQuestionnaire', 'manageDocuments'],
		type: 'success',
		text: 'Document filename updated'
	},
	documentDeleted: {
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire'],
		type: 'success',
		text: 'Document removed'
	},
	appellantCaseNotValid: {
		pages: ['appellantCase']
	},
	readyForDecision: {
		pages: ['appealDetails']
	},
	readyForValidation: {
		pages: ['appealDetails']
	},
	readyForSetUpSiteVisit: {
		pages: ['appealDetails']
	},
	readyForLpaQuestionnaireReview: {
		pages: ['appealDetails']
	},
	progressToFinalComments: {
		pages: ['appealDetails']
	},
	lpaQuestionnaireNotValid: {
		pages: ['lpaQuestionnaire']
	},
	notCheckedDocument: {
		pages: ['lpaQuestionnaire', 'manageDocuments', 'appellantCase', 'manageFolder'],
		html: '<p class="govuk-notification-banner__heading">Virus scan in progress</p></br><a class="govuk-notification-banner__link" href="./" data-cy/"refresh-page/" >Refresh page to see if scan has finished</a>'
	},
	appealAwaitingTransfer: {
		pages: ['appealDetails'],
		html: '<p class="govuk-notification-banner__heading">This appeal is awaiting transfer</p><p class="govuk-body">The appeal must be transferred to Horizon. When this is done, update the appeal with the new horizon reference.</p>'
	},
	horizonReferenceAdded: {
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire'],
		type: 'success',
		text: 'Horizon reference added'
	},
	assignCaseOfficer: {
		pages: ['appealDetails']
	},
	appealLinked: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire']
	},
	appealUnlinked: {
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire'],
		type: 'success'
	},
	otherAppeal: {
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire'],
		type: 'success'
	},
	otherAppealRemoved: {
		pages: ['appealDetails', 'manageRelatedAppeals', 'appellantCase', 'lpaQuestionnaire'],
		type: 'success'
	},
	neighbouringSiteAdded: {
		type: 'success',
		pages: ['appealDetails', 'lpaQuestionnaire']
	},
	neighbouringSiteUpdated: {
		type: 'success',
		pages: ['appealDetails', 'lpaQuestionnaire']
	},
	neighbouringSiteRemoved: {
		type: 'success',
		pages: ['appealDetails', 'lpaQuestionnaire', 'manageNeighbouringSites']
	},
	appealValidAndReadyToStart: {
		pages: ['appealDetails']
	},
	costsDocumentAdded: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Costs document uploaded'
	},
	internalCorrespondenceDocumentAdded: {
		pages: ['appealDetails'],
		type: 'success',
		text: 'Internal correspondence document uploaded'
	},
	serviceUserUpdated: {
		pages: ['appealDetails', 'appellantCase'],
		type: 'success'
	},
	lpaReferenceUpdated: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire']
	},
	inspectorAccessUpdated: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire']
	},
	neighbouringSiteAffected: {
		type: 'success',
		pages: ['appealDetails', 'lpaQuestionnaire']
	},
	siteAddressUpdated: {
		type: 'success',
		pages: ['appellantCase'],
		text: 'Site address updated'
	},
	isAppealTypeCorrectUpdated: {
		type: 'success',
		pages: ['lpaQuestionnaire'],
		text: 'Correct appeal type (LPA response) has been updated'
	},
	lpaqDueDateUpdated: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'LPA questionnaire due date changed'
	},
	timetableDueDateUpdated: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Timetable updated'
	},
	changePage: {
		type: 'success',
		pages: ['appealDetails', 'appellantCase', 'lpaQuestionnaire', 'ipComments']
	},
	lpaStatementAwaitingReview: {
		pages: ['appealDetails']
	},
	interestedPartyCommentsAwaitingReview: {
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
		pages: ['viewIpComment'],
		text: 'Comment redacted and accepted'
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
		pages: ['appealDetails']
	},
	lpaFinalCommentsAwaitingReview: {
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
	shareCommentsAndLpaStatement: {
		pages: ['appealDetails']
	},
	finalCommentsDocumentAddedSuccess: {
		type: 'success',
		pages: ['viewFinalComments'],
		text: 'Supporting document added'
	},
	finalCommentsAcceptSuccess: {
		type: 'success',
		pages: ['appealDetails'],
		text: 'Final comments accepted'
	}
};

/**
 *
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {ServicePageName} servicePage
 * @param {number} appealId
 * @returns {PageComponent[]}
 */
export function buildNotificationBanners(session, servicePage, appealId) {
	const appealIdAsString = typeof appealId === 'number' ? appealId.toString() : appealId;

	if (!('notificationBanners' in session) || !(appealIdAsString in session.notificationBanners)) {
		return [];
	}

	/** @type {NotificationBannerDefinitionKey[]} */
	const displayedBannerKeys = [];

	/**
	 * @type {PageComponent[]}
	 */
	const notificationBanners = session.notificationBanners[appealIdAsString]
		.flatMap((/** @type {import('#lib/session-utilities.js').NotificationBannerSessionData} */ bannerData) => {
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
		});
	
	session.notificationBanners[appealIdAsString] = session.notificationBanners[appealIdAsString]
		.filter((/** @type {import('#lib/session-utilities.js').NotificationBannerSessionData} */ bannerData) => !displayedBannerKeys.includes(bannerData.key));

	return notificationBanners;
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
export function createNotificationBanner({ bannerDefinitionKey, titleText, text, html, pageComponents }) {
	const bannerDefinition = notificationBannerDefinitions[bannerDefinitionKey];

	return {
		type: 'notification-banner',
		parameters: {
			titleText: titleText || ('type' in bannerDefinition && bannerDefinition.type === 'success' ? 'Success' : 'Important'),
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
