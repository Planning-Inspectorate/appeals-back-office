import { generateIssueDecisionUrl } from '#appeals/appeal-details/issue-decision/issue-decision.utils.js';
import {
	createNotificationBanner,
	mapRequiredActionToNotificationBannerKey
} from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import config from '../../../../../environment/config.js';
import { getRequiredActionsForAppeal } from './required-actions.js';

/** @typedef {import('./required-actions.js').AppealRequiredAction} AppealRequiredAction */
/** @typedef {import('../components/index.js').NotificationBannerDefinitionKey} NotificationBannerDefinitionKey */

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {PageComponent[]}
 */
export function mapStatusDependentNotifications(appealDetails, request) {
	const requiredActions = getRequiredActionsForAppeal(appealDetails, 'detail');

	/** @type {import('../components/index.js').NotificationBannerDefinitionKey[]} */
	const bannerKeys = requiredActions
		.map(mapRequiredActionToNotificationBannerKey)
		.filter(/** @returns {item is NotificationBannerDefinitionKey} */ (item) => item !== undefined);

	return bannerKeys
		.map((bannerKey) => mapBannerKeysToNotificationBanners(bannerKey, appealDetails, request))
		.filter(/** @returns {item is PageComponent} */ (item) => item !== undefined);
}

/**
 * @param {NotificationBannerDefinitionKey} bannerDefinitionKey
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {PageComponent|undefined}
 */
function mapBannerKeysToNotificationBanners(bannerDefinitionKey, appealDetails, request) {
	// ToDo banners will be removed from this list once the child appeals automatically do the action via the lead appeal
	const ALLOWED_CHILD_APPEAL_BANNERS = [
		'awaitingLinkedAppeal',
		'appealAwaitingTransfer',
		'appealAwaitingTransferOld',
		'assignCaseOfficer',
		'readyForValidation',
		'readyForLpaQuestionnaireReview',
		'addHearingAddress',
		'setupHearing',
		'addResidencesNetChange'
	];

	if (isChildAppeal(appealDetails) && !ALLOWED_CHILD_APPEAL_BANNERS.includes(bannerDefinitionKey)) {
		// Do not display the banner
		return;
	}

	switch (bannerDefinitionKey) {
		case 'awaitingLinkedAppeal':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">Awaiting linked appeal</p>`
			});
		case 'appealAwaitingTransfer':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading"><a class="govuk-link" data-cy="awaiting-transfer" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-type/add-horizon-reference`
				)}">Mark as transferred</a></p>`
			});
		case 'appealAwaitingTransferOld':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">This appeal is awaiting transfer</p><p class="govuk-body">The appeal must be transferred to Horizon. When this is done, <a class="govuk-link" data-cy="awaiting-transfer" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-type/add-horizon-reference`
				)}">update the appeal with the new horizon reference</a>.</p>`
			});
		case 'readyForSetUpSiteVisit':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">Site visit ready to set up</p><p><a class="govuk-notification-banner__link" data-cy="set-up-site-visit-banner" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/site-visit/schedule-visit`
				)}">Set up site visit</a></p>`
			});
		case 'assignCaseOfficer':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">Appeal ready to be assigned to case officer</p><p><a class="govuk-notification-banner__link" href="${addBackLinkQueryToUrl(
					request,
					config.featureFlags.featureFlagSimplifyTeamAssignment
						? `/appeals-service/appeal-details/${appealDetails.appealId}/assign-case-officer/search-case-officer`
						: `/appeals-service/appeal-details/${appealDetails.appealId}/assign-user/case-officer`
				)}" data-cy="banner-assign-case-officer">Assign case officer</a></p>`
			});
		case 'readyForDecision':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">Ready for decision</p><p><a class="govuk-notification-banner__link" data-cy="issue-determination" href="${addBackLinkQueryToUrl(
					request,
					generateIssueDecisionUrl(appealDetails.appealId)
				)}">Issue decision</a></p>`
			});
		case 'issueAppellantCostsDecision':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a class="govuk-notification-banner__link" data-cy="issue-appellant-costs-decision" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/issue-decision/issue-appellant-costs-decision-letter-upload`
				)}">Issue appellant costs decision</a>`
			});
		case 'issueLpaCostsDecision':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a class="govuk-notification-banner__link" data-cy="issue-lpa-costs-decision" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/issue-decision/issue-lpa-costs-decision-letter-upload`
				)}">Issue LPA costs decision</a>`
			});
		case 'progressFromFinalComments':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/share`
				)}" class="govuk-heading-s govuk-notification-banner__link">Progress case</a>`
			});
		case 'progressFromStatements':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/share`
				)}" class="govuk-heading-s govuk-notification-banner__link">Progress to final comments</a>`
			});
		case 'progressHearingCaseWithNoRepsFromStatements':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/share`
				)}" class="govuk-heading-s govuk-notification-banner__link">Progress to hearing ready to set up</a>`
			});
		case 'progressHearingCaseWithNoRepsAndHearingSetUpFromStatements':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/share`
				)}" class="govuk-heading-s govuk-notification-banner__link">Progress to awaiting hearing</a>`
			});
		case 'readyForValidation':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">Appeal ready for validation</p><p><a class="govuk-notification-banner__link" data-cy="validate-appeal" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case`
				)}">Validate <span class="govuk-visually-hidden">appeal</span></a></p>`
			});
		case 'appellantFinalCommentsAwaitingReview':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">Appellant final comments awaiting review</p><p><a class="govuk-notification-banner__link" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/appellant`
				)}" data-cy="banner-review-appellant-final-comments">Review <span class="govuk-visually-hidden">appellant final comments</span></a></p>`
			});
		case 'lpaFinalCommentsAwaitingReview':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">LPA final comments awaiting review</p><p><a class="govuk-notification-banner__link" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/lpa`
				)}" data-cy="banner-review-lpa-final-comments">Review <span class="govuk-visually-hidden">L P A final comments</span></a></p>`
			});
		case 'interestedPartyCommentsAwaitingReview':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">Interested party comments awaiting review</p><p><a class="govuk-notification-banner__link" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments`
				)}" data-cy="banner-review-ip-comments">Review <span class="govuk-visually-hidden">interested party comments</span></a></p>`
			});
		case 'readyForLpaQuestionnaireReview':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">LPA questionnaire ready for review</p><p><a class="govuk-notification-banner__link" data-cy="review-lpa-questionnaire-banner" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/lpa-questionnaire/${appealDetails.lpaQuestionnaireId}`
				)}">Review <span class="govuk-visually-hidden">LPA questionnaire</span></a></p>`
			});
		case 'lpaStatementAwaitingReview':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">LPA statement awaiting review</p><p><a class="govuk-notification-banner__link" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement`
				)}" data-cy="banner-review-lpa-statement">Review <span class="govuk-visually-hidden">LPA statement</span></a></p>`
			});
		case 'shareFinalComments':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/share`
				)}" class="govuk-heading-s govuk-notification-banner__link">Share final comments</a>`
			});
		case 'shareCommentsAndLpaStatement':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/share`
				)}" class="govuk-heading-s govuk-notification-banner__link">Share IP comments and LPA statement</a>`
			});
		case 'appealValidAndReadyToStart':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">Appeal valid</p><p><a class="govuk-notification-banner__link" data-cy="ready-to-start" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/start-case/add`
				)}">Start case</a></p>`
			});
		case 'updateLpaStatement':
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<p class="govuk-notification-banner__heading">LPA statement incomplete</p> <a href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement`
				)}" class="govuk-heading-s govuk-notification-banner__link">Update LPA statement</a>`
			});
		case 'addHearingAddress': {
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a class="govuk-link" data-cy="add-hearing-address" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/hearing/change/address-details`
				)}">Add hearing address</a>`
			});
		}
		case 'setupHearing': {
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a class="govuk-link" data-cy="setup-hearing" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/hearing/setup/date`
				)}">Set up hearing</a>`
			});
		}
		case 'addResidencesNetChange': {
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a class="govuk-link" data-cy="add-residences-net-change" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/residential-units/new`
				)}">Add number of residential units</a>`
			});
		}
		case 'reviewLpaProofOfEvidence': {
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a class="govuk-link" data-cy="review-lpa-proof-of-evidence" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/proof-of-evidence/lpa`
				)}">Review LPA proof of evidence and witnesses</a>`
			});
		}
		case 'reviewAppellantProofOfEvidence': {
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a class="govuk-link" data-cy="review-appellant-proof-of-evidence" href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/proof-of-evidence/appellant`
				)}">Review appellant proof of evidence and witnesses</a>`
			});
		}
		case 'progressToProofOfEvidenceAndWitnesses': {
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/share`
				)}" class="govuk-heading-s govuk-notification-banner__link">Progress to proof of evidence and witnesses</a>`
			});
		}
		case 'progressToInquiry': {
			return createNotificationBanner({
				bannerDefinitionKey,
				html: `<a href="${addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appealDetails.appealId}/share`
				)}" class="govuk-heading-s govuk-notification-banner__link">Progress to inquiry</a>`
			});
		}
	}
}
