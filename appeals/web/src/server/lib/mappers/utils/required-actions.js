import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from 'pins-data-model';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { dateIsInThePast, dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import {
	DOCUMENT_STATUS_RECEIVED,
	DOCUMENT_STATUS_NOT_RECEIVED,
	VALIDATION_OUTCOME_INCOMPLETE
	// @ts-ignore
} from '@pins/appeals/constants/support.js';

/** @typedef {'addHorizonReference'|'appellantCaseOverdue'|'arrangeSiteVisit'|'assignCaseOfficer'|'awaitingAppellantUpdate'|'awaitingFinalComments'|'awaitingIpComments'|'awaitingLpaQuestionnaire'|'awaitingLpaStatement'|'awaitingLpaUpdate'|'issueDecision'|'lpaQuestionnaireOverdue'|'progressFromFinalComments'|'progressFromStatements'|'reviewAppellantCase'|'reviewAppellantFinalComments'|'reviewIpComments'|'reviewLpaFinalComments'|'reviewLpaQuestionnaire'|'reviewLpaStatement'|'shareFinalComments'|'shareIpCommentsAndLpaStatement'|'startAppeal'|'updateLpaStatement'|'addHearingAddress'|'setupHearing'} AppealRequiredAction */

/**
 * This logic is documented in `docs/reference/appeal-action-required-logic.md`. Please ensure this document is kept updated to reflect any changes made in this function.
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal|import('#appeals/personal-list/personal-list.mapper').PersonalListAppeal} appealDetails
 * @returns {AppealRequiredAction[]}
 */
export function getRequiredActionsForAppeal(appealDetails) {
	/** @type {AppealRequiredAction[]} */
	const actions = [];

	switch (appealDetails.appealStatus) {
		case APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER:
			actions.push('assignCaseOfficer');
			break;
		case APPEAL_CASE_STATUS.READY_TO_START:
			actions.push('startAppeal');
			break;
		case APPEAL_CASE_STATUS.AWAITING_TRANSFER:
			actions.push('addHorizonReference');
			break;
		case APPEAL_CASE_STATUS.EVENT:
			// @ts-ignore
			if (!appealDetails.siteVisit) {
				actions.push('arrangeSiteVisit');
			}

			if (
				appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.HEARING.toLowerCase()
			) {
				// @ts-ignore
				if (!appealDetails.hearing) {
					actions.push('setupHearing');
				}

				if (
					// @ts-ignore
					appealDetails.hearing &&
					// @ts-ignore
					!appealDetails.hearing?.addressId &&
					// @ts-ignore
					!appealDetails.hearing?.address
				) {
					actions.push('addHearingAddress');
				}
			}
			break;
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION:
			actions.push('issueDecision');
			break;
		case APPEAL_CASE_STATUS.VALIDATION: {
			const appellantCaseOverdue =
				appealDetails.documentationSummary.appellantCase?.dueDate &&
				dateIsInThePast(
					dateISOStringToDayMonthYearHourMinute(
						appealDetails.documentationSummary.appellantCase?.dueDate
					)
				);
			const appellantCaseIncomplete =
				appealDetails.documentationSummary.appellantCase?.status === VALIDATION_OUTCOME_INCOMPLETE;
			const appellantCaseReceived =
				appealDetails.documentationSummary.appellantCase?.status === DOCUMENT_STATUS_RECEIVED;

			if (appellantCaseOverdue) {
				actions.push('appellantCaseOverdue');
			} else if (appellantCaseIncomplete) {
				actions.push('awaitingAppellantUpdate');
			} else if (appellantCaseReceived) {
				actions.push('reviewAppellantCase');
			}
			break;
		}
		case APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE: {
			const lpaQuestionnaireStatus = appealDetails.documentationSummary.lpaQuestionnaire?.status;

			if (lpaQuestionnaireStatus && lpaQuestionnaireStatus === DOCUMENT_STATUS_NOT_RECEIVED) {
				const lpaQuestionnaireDueDate =
					appealDetails.documentationSummary.lpaQuestionnaire?.dueDate;
				const lpaQuestionnaireOverdue =
					lpaQuestionnaireDueDate &&
					dateIsInThePast(dateISOStringToDayMonthYearHourMinute(lpaQuestionnaireDueDate));

				if (lpaQuestionnaireOverdue) {
					actions.push('lpaQuestionnaireOverdue');
				} else {
					actions.push('awaitingLpaQuestionnaire');
				}
			} else {
				const lpaQuestionnaireIncomplete =
					lpaQuestionnaireStatus && lpaQuestionnaireStatus === VALIDATION_OUTCOME_INCOMPLETE;

				if (lpaQuestionnaireIncomplete) {
					actions.push('awaitingLpaUpdate');
				} else {
					actions.push('reviewLpaQuestionnaire');
				}
			}
			break;
		}
		case APPEAL_CASE_STATUS.STATEMENTS: {
			const ipCommentsCounts = appealDetails.documentationSummary.ipComments?.counts;
			const ipCommentsAwaitingReviewCount =
				ipCommentsCounts?.[APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW];
			const ipCommentsDueDate = appealDetails?.appealTimetable?.ipCommentsDueDate;
			const ipCommentsAwaitingReview =
				ipCommentsAwaitingReviewCount && ipCommentsAwaitingReviewCount > 0;
			const ipCommentsDueDatePassed =
				!ipCommentsDueDate ||
				dateIsInThePast(dateISOStringToDayMonthYearHourMinute(ipCommentsDueDate));

			const lpaStatementStatus = appealDetails.documentationSummary.lpaStatement?.status;
			const lpaStatementRepresentationStatus =
				appealDetails.documentationSummary.lpaStatement?.representationStatus;
			const lpaStatementNotReceived =
				!lpaStatementStatus || lpaStatementStatus === DOCUMENT_STATUS_NOT_RECEIVED;
			const lpaStatementAwaitingReview =
				lpaStatementRepresentationStatus &&
				lpaStatementRepresentationStatus === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;
			const lpaStatementIncomplete =
				lpaStatementRepresentationStatus &&
				lpaStatementRepresentationStatus === APPEAL_REPRESENTATION_STATUS.INCOMPLETE;
			const lpaStatementDueDate = appealDetails?.appealTimetable?.lpaStatementDueDate;
			const lpaStatementDueDatePassed =
				!lpaStatementDueDate ||
				dateIsInThePast(dateISOStringToDayMonthYearHourMinute(lpaStatementDueDate));

			const hasItemsToShare =
				lpaStatementRepresentationStatus === APPEAL_REPRESENTATION_STATUS.VALID ||
				lpaStatementRepresentationStatus === APPEAL_REPRESENTATION_STATUS.INCOMPLETE ||
				(ipCommentsCounts?.valid && ipCommentsCounts?.valid > 0);

			if (
				ipCommentsDueDatePassed &&
				lpaStatementDueDatePassed &&
				!ipCommentsAwaitingReview &&
				!lpaStatementAwaitingReview
			) {
				if (hasItemsToShare) {
					actions.push('shareIpCommentsAndLpaStatement');
				} else {
					actions.push('progressFromStatements');
				}

				if (lpaStatementIncomplete) {
					actions.push('updateLpaStatement');
				}
			} else {
				if (ipCommentsAwaitingReview) {
					actions.push('reviewIpComments');
				} else if (!ipCommentsDueDatePassed) {
					actions.push('awaitingIpComments');
				}

				if (lpaStatementNotReceived) {
					actions.push('awaitingLpaStatement');
				} else if (lpaStatementAwaitingReview) {
					actions.push('reviewLpaStatement');
				} else if (lpaStatementIncomplete) {
					actions.push('updateLpaStatement');
				}
			}

			break;
		}
		case APPEAL_CASE_STATUS.FINAL_COMMENTS: {
			const finalCommentsDueDate = appealDetails?.appealTimetable?.finalCommentsDueDate;
			const finalCommentsDueDatePassed =
				!finalCommentsDueDate ||
				dateIsInThePast(dateISOStringToDayMonthYearHourMinute(finalCommentsDueDate));

			const appellantFinalCommentsStatus =
				appealDetails.documentationSummary.appellantFinalComments?.status;
			const appellantFinalCommentsRepresentationStatus =
				appealDetails.documentationSummary.appellantFinalComments?.representationStatus;
			const appellantFinalCommentsReceived =
				appellantFinalCommentsStatus === DOCUMENT_STATUS_RECEIVED;
			const appellantFinalCommentsAwaitingReview =
				appellantFinalCommentsReceived &&
				appellantFinalCommentsRepresentationStatus === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;
			const appellantFinalCommentsToShare =
				appellantFinalCommentsRepresentationStatus === APPEAL_REPRESENTATION_STATUS.VALID;

			const lpaFinalCommentsStatus = appealDetails.documentationSummary.lpaFinalComments?.status;
			const lpaFinalCommentsRepresentationStatus =
				appealDetails.documentationSummary.lpaFinalComments?.representationStatus;
			const lpaFinalCommentsReceived = lpaFinalCommentsStatus === DOCUMENT_STATUS_RECEIVED;
			const lpaFinalCommentsAwaitingReview =
				lpaFinalCommentsReceived &&
				lpaFinalCommentsRepresentationStatus === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;
			const lpaFinalCommentsToShare =
				lpaFinalCommentsRepresentationStatus === APPEAL_REPRESENTATION_STATUS.VALID;

			if (!appellantFinalCommentsAwaitingReview && !lpaFinalCommentsAwaitingReview) {
				if (finalCommentsDueDatePassed) {
					if (appellantFinalCommentsToShare || lpaFinalCommentsToShare) {
						actions.push('shareFinalComments');
					} else {
						actions.push('progressFromFinalComments');
					}
				} else {
					actions.push('awaitingFinalComments');
				}
			} else {
				if (appellantFinalCommentsAwaitingReview) {
					actions.push('reviewAppellantFinalComments');
				}
				if (lpaFinalCommentsAwaitingReview) {
					actions.push('reviewLpaFinalComments');
				}
			}
			break;
		}
		default:
			break;
	}

	return actions;
}
