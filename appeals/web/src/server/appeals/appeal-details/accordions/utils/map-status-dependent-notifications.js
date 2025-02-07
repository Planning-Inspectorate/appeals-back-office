import { dateIsInThePast, dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import {
	generateIssueDecisionUrl,
	generateStartTimetableUrl
} from '../../issue-decision/issue-decision.mapper.js';
import { createImportantBanner } from '#lib/mappers/index.js';

/**
 * @param {import('../../appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('../index.js').RepresentationTypesAwaitingReview} [representationTypesAwaitingReview]
 * @returns {PageComponent[]}
 */
export function mapStatusDependentNotifications(appealDetails, representationTypesAwaitingReview) {
	/** @type {PageComponent[]} */
	const notifications = [];

	switch (appealDetails.appealStatus) {
		case APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER:
			return mapStatusDependentNotificationsForAssignCaseOfficer(appealDetails.appealId);
		case APPEAL_CASE_STATUS.VALIDATION:
			return mapStatusDependentNotificationsForValidation(appealDetails.appealId);
		case APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE:
			return mapStatusDependentNotificationsForLPAQuestionnaire(
				appealDetails.appealId,
				appealDetails.lpaQuestionnaireId
			);
		case APPEAL_CASE_STATUS.EVENT:
			return mapStatusDependentNotificationsForEvent(appealDetails.appealId);
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION:
			return mapStatusDependentNotificationsForIssueDetermination(appealDetails.appealId);
		case APPEAL_CASE_STATUS.READY_TO_START:
			return mapStatusDependentNotificationsForReadyToStart(appealDetails.appealId);
		case APPEAL_CASE_STATUS.AWAITING_TRANSFER:
			return mapStatusDependentNotificationsForAwaitingTransfer(appealDetails.appealId);
		case APPEAL_CASE_STATUS.STATEMENTS:
			return mapStatusDependentNotificationsForStatements(
				appealDetails,
				representationTypesAwaitingReview
			);
		case APPEAL_CASE_STATUS.FINAL_COMMENTS:
			return mapStatusDependentNotificationsForFinalComments(
				appealDetails.appealId,
				representationTypesAwaitingReview
			);
		default:
			break;
	}

	return notifications;
}

/**
 * @param {number} appealId
 * @returns {PageComponent[]}
 */
function mapStatusDependentNotificationsForAssignCaseOfficer(appealId) {
	return [
		createImportantBanner({
			bannerType: 'assignCaseOfficer',
			html: `<p class="govuk-notification-banner__heading">Appeal ready to be assigned to case officer</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealId}/assign-user/case-officer" data-cy="banner-assign-case-officer">Assign case officer</a></p>`
		})
	];
}

/**
 * @param {number} appealId
 * @returns {PageComponent[]}
 */
function mapStatusDependentNotificationsForValidation(appealId) {
	return [
		createImportantBanner({
			bannerType: 'readyForValidation',
			html: `<p class="govuk-notification-banner__heading">Appeal ready for validation</p><p><a class="govuk-notification-banner__link" data-cy="validate-appeal" href="/appeals-service/appeal-details/${appealId}/appellant-case">Validate <span class="govuk-visually-hidden">appeal</span></a></p>`
		})
	];
}

/**
 * @param {number} appealId
 * @param {number|null|undefined} lpaQuestionnaireId
 * @returns {PageComponent[]}
 */
function mapStatusDependentNotificationsForLPAQuestionnaire(appealId, lpaQuestionnaireId) {
	if (typeof lpaQuestionnaireId === 'number') {
		return [
			createImportantBanner({
				bannerType: 'readyForLpaQuestionnaireReview',
				html: `<p class="govuk-notification-banner__heading">LPA questionnaire ready for review</p><p><a class="govuk-notification-banner__link" data-cy="review-lpa-questionnaire-banner" href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}">Review <span class="govuk-visually-hidden">LPA questionnaire</span></a></p>`
			})
		];
	}

	return [];
}

/**
 * @param {number} appealId
 * @returns {PageComponent[]}
 */
function mapStatusDependentNotificationsForEvent(appealId) {
	return [
		createImportantBanner({
			bannerType: 'readyForSetUpSiteVisit',
			html: `<p class="govuk-notification-banner__heading">Site visit ready to set up</p><p><a class="govuk-notification-banner__link" data-cy="set-up-site-visit-banner" href="/appeals-service/appeal-details/${appealId}/site-visit/schedule-visit">Set up site visit</a></p>`
		})
	];
}

/**
 * @param {number} appealId
 * @returns {PageComponent[]}
 */
function mapStatusDependentNotificationsForIssueDetermination(appealId) {
	return [
		createImportantBanner({
			bannerType: 'readyForDecision',
			html: `<p class="govuk-notification-banner__heading">Ready for decision</p><p><a class="govuk-notification-banner__link" data-cy="issue-determination" href="${generateIssueDecisionUrl(
				appealId
			)}">Issue decision</a></p>`
		})
	];
}

/**
 * @param {number} appealId
 * @returns {PageComponent[]}
 */
function mapStatusDependentNotificationsForReadyToStart(appealId) {
	return [
		createImportantBanner({
			bannerType: 'appealValidAndReadyToStart',
			html: `<p class="govuk-notification-banner__heading">Appeal valid</p><p><a class="govuk-notification-banner__link" data-cy="ready-to-start" href="${generateStartTimetableUrl(
				appealId
			)}">Start case</a></p>`
		})
	];
}

/**
 * @param {number} appealId
 * @returns {PageComponent[]}
 */
function mapStatusDependentNotificationsForAwaitingTransfer(appealId) {
	return [
		createImportantBanner({
			bannerType: 'appealAwaitingTransfer',
			html: `<p class="govuk-notification-banner__heading">This appeal is awaiting transfer</p><p class="govuk-body">The appeal must be transferred to Horizon. When this is done, <a class="govuk-link" data-cy="awaiting-transfer" href="/appeals-service/appeal-details/${appealId}/change-appeal-type/add-horizon-reference">update the appeal with the new horizon reference</a>.</p>`
		})
	];
}

/**
 * @param {import('../../appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('../index.js').RepresentationTypesAwaitingReview} [representationTypesAwaitingReview]
 * @returns {PageComponent[]}
 */
function mapStatusDependentNotificationsForStatements(
	appealDetails,
	representationTypesAwaitingReview
) {
	const isIpCommentsDueDatePassed = appealDetails.appealTimetable?.ipCommentsDueDate
		? dateIsInThePast(
				dateISOStringToDayMonthYearHourMinute(appealDetails.appealTimetable.ipCommentsDueDate)
		  )
		: false;

	const isLpaStatementDueDatePassed = appealDetails.appealTimetable?.lpaStatementDueDate
		? dateIsInThePast(
				dateISOStringToDayMonthYearHourMinute(appealDetails.appealTimetable.lpaStatementDueDate)
		  )
		: false;

	if (
		isLpaStatementDueDatePassed &&
		!representationTypesAwaitingReview?.ipComments &&
		!representationTypesAwaitingReview?.lpaStatement
	) {
		return [
			createImportantBanner({
				bannerType: 'shareCommentsAndLpaStatement',
				html: `<a href="/appeals-service/appeal-details/${appealDetails.appealId}/share" class="govuk-heading-s govuk-notification-banner__link">Share IP comments and LPA statement</a>`
			})
		];
	}

	if (
		isLpaStatementDueDatePassed &&
		isIpCommentsDueDatePassed &&
		!(
			representationTypesAwaitingReview?.ipComments &&
			representationTypesAwaitingReview?.lpaStatement
		)
	) {
		return [
			createImportantBanner({
				bannerType: 'progressToFinalComments',
				html: `<a href="/appeals-service/appeal-details/${appealDetails.appealId}/share" class="govuk-heading-s govuk-notification-banner__link">Progress to final comments</a>`
			})
		];
	}

	/** @type {PageComponent[]} */
	const banners = [];

	if (representationTypesAwaitingReview?.ipComments) {
		banners.push(
			createImportantBanner({
				bannerType: 'interestedPartyCommentsAwaitingReview',
				html: `<p class="govuk-notification-banner__heading">Interested party comments awaiting review</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments" data-cy="banner-review-ip-comments">Review <span class="govuk-visually-hidden">interested party comments</span></a></p>`
			})
		);
	}
	if (representationTypesAwaitingReview?.lpaStatement) {
		banners.push(
			createImportantBanner({
				bannerType: 'lpaStatementAwaitingReview',
				html: `<p class="govuk-notification-banner__heading">LPA statement awaiting review</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement" data-cy="banner-review-lpa-statement">Review <span class="govuk-visually-hidden">LPA statement</span></a></p>`
			})
		);
	}

	return banners;
}

/**
 * @param {number} appealId
 * @param {import('../index.js').RepresentationTypesAwaitingReview} [representationTypesAwaitingReview]
 * @returns {PageComponent[]}
 */
function mapStatusDependentNotificationsForFinalComments(
	appealId,
	representationTypesAwaitingReview
) {
	/** @type {PageComponent[]} */
	const banners = [];

	if (representationTypesAwaitingReview?.appellantFinalComments) {
		banners.push(
			createImportantBanner({
				bannerType: 'appellantFinalCommentsAwaitingReview',
				html: `<p class="govuk-notification-banner__heading">Appellant final comments awaiting review</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealId}/final-comments/appellant" data-cy="banner-review-appellant-final-comments">Review <span class="govuk-visually-hidden">appellant final comments</span></a></p>`
			})
		);
	}
	if (representationTypesAwaitingReview?.lpaFinalComments) {
		banners.push(
			createImportantBanner({
				bannerType: 'lpaFinalCommentsAwaitingReview',
				html: `<p class="govuk-notification-banner__heading">LPA final comments awaiting review</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealId}/final-comments/lpa" data-cy="banner-review-lpa-final-comments">Review <span class="govuk-visually-hidden">L P A final comments</span></a></p>`
			})
		);
	}

	return banners;
}
