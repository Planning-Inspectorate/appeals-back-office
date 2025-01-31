import { dateIsInThePast, dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { addNotificationBannerToSession, clearNotificationBannerFromSession } from '#lib/session-utilities.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { removeAccordionComponentsActions } from './remove-accordion-components-actions.js';
import {
	generateIssueDecisionUrl,
	generateStartTimetableUrl
} from '../../issue-decision/issue-decision.mapper.js';

/**
 * @param {import('../../appeal-details.types.js').WebAppeal} appealDetails
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {PageComponent[]} accordionComponents
 * @param {import('../index.js').RepresentationTypesAwaitingReview} [representationTypesAwaitingReview]
 * @returns {void}
 */
export function mapStatusDependentNotifications(
	appealDetails,
	session,
	accordionComponents,
	representationTypesAwaitingReview
) {
	switch (appealDetails.appealStatus) {
		case APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER:
			addNotificationBannerToSession(
				session,
				'assignCaseOfficer',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">Appeal ready to be assigned to case officer</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealDetails.appealId}/assign-user/case-officer" data-cy="banner-assign-case-officer">Assign case officer</a></p>`
			);
			break;
		case APPEAL_CASE_STATUS.VALIDATION:
			addNotificationBannerToSession(
				session,
				'readyForValidation',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">Appeal ready for validation</p><p><a class="govuk-notification-banner__link" data-cy="validate-appeal" href="/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case">Validate <span class="govuk-visually-hidden">appeal</span></a></p>`
			);
			break;
		case APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE:
			if (appealDetails.lpaQuestionnaireId) {
				addNotificationBannerToSession(
					session,
					'readyForLpaQuestionnaireReview',
					appealDetails.appealId,
					`<p class="govuk-notification-banner__heading">LPA questionnaire ready for review</p><p><a class="govuk-notification-banner__link" data-cy="review-lpa-questionnaire-banner" href="/appeals-service/appeal-details/${appealDetails.appealId}/lpa-questionnaire/${appealDetails.lpaQuestionnaireId}">Review <span class="govuk-visually-hidden">LPA questionnaire</span></a></p>`
				);
			}
			break;
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION:
			addNotificationBannerToSession(
				session,
				'readyForDecision',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">Ready for decision</p><p><a class="govuk-notification-banner__link" data-cy="issue-determination" href="${generateIssueDecisionUrl(
					appealDetails.appealId
				)}">Issue decision</a></p>`
			);
			break;
		case APPEAL_CASE_STATUS.READY_TO_START:
			addNotificationBannerToSession(
				session,
				'appealValidAndReadyToStart',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">Appeal valid</p><p><a class="govuk-notification-banner__link" data-cy="ready-to-start" href="${generateStartTimetableUrl(
					appealDetails.appealId
				)}">Start case</a></p>`
			);
			break;
		case APPEAL_CASE_STATUS.AWAITING_TRANSFER:
			addNotificationBannerToSession(
				session,
				'appealAwaitingTransfer',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">This appeal is awaiting transfer</p><p class="govuk-body">The appeal must be transferred to Horizon. When this is done, <a class="govuk-link" data-cy="awaiting-transfer" href="/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-type/add-horizon-reference">update the appeal with the new horizon reference</a>.</p>`
			);
			removeAccordionComponentsActions(accordionComponents);
			break;
		case APPEAL_CASE_STATUS.STATEMENTS: {
			const isDueDatePassed = (() => {
				if (!appealDetails.appealTimetable?.lpaStatementDueDate) {
					return false;
				}

				return dateIsInThePast(
					dateISOStringToDayMonthYearHourMinute(appealDetails.appealTimetable.lpaStatementDueDate)
				);
			})();

			if (
				isDueDatePassed &&
				!representationTypesAwaitingReview?.ipComments &&
				!representationTypesAwaitingReview?.lpaStatement
			) {
				addNotificationBannerToSession(
					session,
					'shareCommentsAndLpaStatement',
					appealDetails.appealId,
					`<a href="/appeals-service/appeal-details/${appealDetails.appealId}/share" class="govuk-heading-s govuk-notification-banner__link">Share IP comments and LPA statement</a>`
				);
				break;
			}

			if (representationTypesAwaitingReview?.ipComments) {
				addNotificationBannerToSession(
					session,
					'interestedPartyCommentsAwaitingReview',
					appealDetails.appealId,
					`<p class="govuk-notification-banner__heading">Interested party comments awaiting review</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments" data-cy="banner-review-ip-comments">Review <span class="govuk-visually-hidden">interested party comments</span></a></p>`
				);
			}
			if (representationTypesAwaitingReview?.lpaStatement) {
				addNotificationBannerToSession(
					session,
					'lpaStatementAwaitingReview',
					appealDetails.appealId,
					`<p class="govuk-notification-banner__heading">LPA statement awaiting review</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement" data-cy="banner-review-lpa-statement">Review <span class="govuk-visually-hidden">LPA statement</span></a></p>`
				);
			}
			break;
		}
		case APPEAL_CASE_STATUS.FINAL_COMMENTS:
			if (representationTypesAwaitingReview?.appellantFinalComments) {
				addNotificationBannerToSession(
					session,
					'appellantFinalCommentsAwaitingReview',
					appealDetails.appealId,
					`<p class="govuk-notification-banner__heading">Appellant final comments awaiting review</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/appellant" data-cy="banner-review-appellant-final-comments">Review <span class="govuk-visually-hidden">appellant final comments</span></a></p>`
				);
			} else {
				clearNotificationBannerFromSession(
					session,
					appealDetails.appealId,
					'appellantFinalCommentsAwaitingReview'
				);
			}
			if (representationTypesAwaitingReview?.lpaFinalComments) {
				addNotificationBannerToSession(
					session,
					'lpaFinalCommentsAwaitingReview',
					appealDetails.appealId,
					`<p class="govuk-notification-banner__heading">LPA final comments awaiting review</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/lpa" data-cy="banner-review-lpa-final-comments">Review <span class="govuk-visually-hidden">L P A final comments</span></a></p>`
				);
			} else {
				clearNotificationBannerFromSession(
					session,
					appealDetails.appealId,
					'lpaFinalCommentsAwaitingReview'
				);
			}
			break;
		default:
			break;
	}

	if (
		'notificationBanners' in session &&
		'appealAwaitingTransfer' in session.notificationBanners &&
		appealDetails.appealStatus !== 'awaiting_transfer'
	) {
		delete session.notificationBanners.appealAwaitingTransfer;
	}
}
