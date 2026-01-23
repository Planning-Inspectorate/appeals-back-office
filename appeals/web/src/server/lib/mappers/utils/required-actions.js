import { isNetResidencesAppealType } from '#common/net-residences-appeal-types.js';
import config from '#environment/config.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { dateIsInThePast, dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import {
	APPEAL_PROOF_OF_EVIDENCE_STATUS,
	APPEAL_REPRESENTATION_STATUS
} from '@pins/appeals/constants/common.js';
import {
	DOCUMENT_STATUS_NOT_RECEIVED,
	DOCUMENT_STATUS_RECEIVED,
	VALIDATION_OUTCOME_INCOMPLETE
	// @ts-ignore
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {'addHorizonReference'|'awaitingEvent'|'appellantCaseOverdue'|'arrangeSiteVisit'|'assignCaseOfficer'|'awaitingAppellantUpdate'|'awaitingFinalComments'|'awaitingIpComments'|'awaitingLpaQuestionnaire'|'awaitingLpaStatement'|'awaitingLpaUpdate'|'awaitingLinkedAppeal'|'issueDecision'|'issueAppellantCostsDecision'|'issueLpaCostsDecision'|'lpaQuestionnaireOverdue'|'progressFromFinalComments' | 'progressHearingCaseWithNoRepsFromStatements' | 'progressHearingCaseWithNoRepsAndHearingSetUpFromStatements' |'progressFromStatements'|'reviewAppellantCase'|'reviewAppellantFinalComments'|'reviewIpComments'|'reviewLpaFinalComments'|'reviewLpaQuestionnaire'|'reviewLpaStatement'|'shareFinalComments'|'shareIpCommentsAndLpaStatement'|'startAppeal'|'updateLpaStatement'|'addHearingAddress'|'setupHearing'|'addResidencesNetChange'|'reviewLpaProofOfEvidence'|'reviewAppellantProofOfEvidence'|'progressToProofOfEvidenceAndWitnesses'|'awaitingProofOfEvidenceAndWitnesses'|'progressToInquiry'|'setupInquiry'|'addInquiryAddress'|'awaitingLpaProofOfEvidenceAndWitnesses'|'awaitingAppellantProofOfEvidenceAndWitnesses'|'awaitingAppellantStatement'|'reviewAppellantStatement'|'awaitingRule6PartyStatement'|'reviewRule6PartyStatement'|'awaitingRule6PartyProofOfEvidence'|'reviewRule6PartyProofOfEvidence'} AppealRequiredAction */

/** @typedef {import('@pins/appeals').CostsDecision} CostsDecision */
/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal */
/** @typedef {import('#appeals/personal-list/personal-list.mapper').PersonalListAppeal} PersonalListAppeal */

/**
 * This logic is documented in `docs/reference/appeal-action-required-logic.md`. Please ensure this document is kept updated to reflect any changes made in this function.
 * @param {WebAppeal|PersonalListAppeal} appealDetails
 * @param { 'summary'|'detail' } view
 * @returns {AppealRequiredAction[]}
 */
export function getRequiredActionsForAppeal(appealDetails, view) {
	/** @type {AppealRequiredAction[]} */
	const actions = [];

	switch (appealDetails.appealStatus) {
		case APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER:
			actions.push('assignCaseOfficer');
			break;
		case APPEAL_CASE_STATUS.READY_TO_START:
			if (appealDetails.awaitingLinkedAppeal && config.featureFlags.featureFlagLinkedAppeals) {
				actions.push('awaitingLinkedAppeal');
				break;
			}
			actions.push('startAppeal');
			break;
		case APPEAL_CASE_STATUS.AWAITING_TRANSFER:
			actions.push('addHorizonReference');
			break;
		case APPEAL_CASE_STATUS.AWAITING_EVENT:
			actions.push('awaitingEvent');
			break;
		case APPEAL_CASE_STATUS.EVENT:
			// appeal types that can't have hearings/inquiries have no procedure type set
			// i.e. HAS is null, S20 before feature flag is turned on is null etc.
			if (
				!appealDetails.procedureType ||
				appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.WRITTEN.toLowerCase()
			) {
				actions.push('arrangeSiteVisit');
				break;
			}

			if (
				appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.HEARING.toLowerCase()
			) {
				if (
					// @ts-ignore
					(view === 'detail' && !appealDetails.hearing) ||
					// @ts-ignore
					(view === 'summary' && !appealDetails.isHearingSetup)
				) {
					actions.push('setupHearing');
					break;
				}

				if (
					(view === 'detail' &&
						// @ts-ignore
						appealDetails.hearing &&
						// @ts-ignore
						!appealDetails.hearing?.addressId &&
						// @ts-ignore
						!appealDetails.hearing?.address) ||
					// @ts-ignore
					(view === 'summary' && !appealDetails.hasHearingAddress)
				) {
					actions.push('addHearingAddress');
					break;
				}
			}

			if (
				appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY.toLowerCase()
			) {
				if (
					// @ts-ignore
					(view === 'detail' && !appealDetails.inquiry) ||
					// @ts-ignore
					(view === 'summary' && !appealDetails.isInquirySetup)
				) {
					actions.push('setupInquiry');
					break;
				}

				if (
					(view === 'detail' &&
						// @ts-ignore
						appealDetails.inquiry &&
						// @ts-ignore
						!appealDetails.inquiry?.addressId &&
						// @ts-ignore
						!appealDetails.inquiry?.address) ||
					// @ts-ignore
					(view === 'summary' && !appealDetails.hasInquiryAddress)
				) {
					actions.push('addInquiryAddress');
				}
			}
			break;
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION:
			actions.push('issueDecision');
			break;
		case APPEAL_CASE_STATUS.VALIDATION: {
			if (appealDetails.awaitingLinkedAppeal && config.featureFlags.featureFlagLinkedAppeals) {
				actions.push('awaitingLinkedAppeal');
				break;
			}

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
			// @ts-ignore
			if (appealDetails.awaitingLinkedAppeal && config.featureFlags.featureFlagLinkedAppeals) {
				actions.push('awaitingLinkedAppeal');
				break;
			}
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
			const statementsDueDate = appealDetails?.appealTimetable?.lpaStatementDueDate;
			const statementsDueDatePassed =
				!statementsDueDate ||
				dateIsInThePast(dateISOStringToDayMonthYearHourMinute(statementsDueDate));

			const appellantStatementStatus =
				appealDetails.documentationSummary.appellantStatement?.status;
			const appellantStatementRepresentationStatus =
				appealDetails.documentationSummary.appellantStatement?.representationStatus;
			const appellantStatementNotReceived =
				!appellantStatementStatus || appellantStatementStatus === DOCUMENT_STATUS_NOT_RECEIVED;
			const appellantStatementAwaitingReview =
				appellantStatementRepresentationStatus &&
				appellantStatementRepresentationStatus === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;

			const appellantStatementEnabled = config.featureFlags.featureFlagAppellantStatement;
			const rule6StatementEnabled = config.featureFlags.featureFlagRule6Statement;

			const rule6PartyStatements = appealDetails.documentationSummary.rule6PartyStatements || {};
			const rule6StatementRepresentationStatuses = Object.values(rule6PartyStatements).map(
				(statement) => statement.representationStatus
			);
			const rule6StatementAwaitingReview = rule6StatementRepresentationStatuses.some(
				(status) => status === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			);
			const rule6StatementNotReceived = Object.values(rule6PartyStatements).some(
				(item) => item.status === DOCUMENT_STATUS_NOT_RECEIVED
			);

			const hasItemsToShare =
				lpaStatementRepresentationStatus === APPEAL_REPRESENTATION_STATUS.VALID ||
				lpaStatementRepresentationStatus === APPEAL_REPRESENTATION_STATUS.INCOMPLETE ||
				(ipCommentsCounts?.valid && ipCommentsCounts?.valid > 0) ||
				(appellantStatementEnabled &&
					(appellantStatementRepresentationStatus === APPEAL_REPRESENTATION_STATUS.VALID ||
						appellantStatementRepresentationStatus === APPEAL_REPRESENTATION_STATUS.INCOMPLETE)) ||
				(rule6StatementEnabled &&
					rule6StatementRepresentationStatuses.some(
						(status) =>
							status === APPEAL_REPRESENTATION_STATUS.VALID ||
							status === APPEAL_REPRESENTATION_STATUS.INCOMPLETE
					));

			const allReviewsCompleted =
				!ipCommentsAwaitingReview &&
				!lpaStatementAwaitingReview &&
				(!appellantStatementEnabled || !appellantStatementAwaitingReview) &&
				(!rule6StatementEnabled || !rule6StatementAwaitingReview);

			if (ipCommentsDueDatePassed && statementsDueDatePassed && allReviewsCompleted) {
				if (hasItemsToShare) {
					actions.push('shareIpCommentsAndLpaStatement');
				} else if (
					// @ts-ignore
					appealDetails.procedureType === 'Hearing' &&
					// @ts-ignore
					appealDetails.hearing?.hearingStartTime &&
					// @ts-ignore
					appealDetails.hearing?.addressId
				) {
					actions.push('progressHearingCaseWithNoRepsAndHearingSetUpFromStatements');
				} else if (appealDetails.procedureType === 'Hearing') {
					actions.push('progressHearingCaseWithNoRepsFromStatements');
				} else if (appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY) {
					actions.push('progressToProofOfEvidenceAndWitnesses');
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

				if (appellantStatementEnabled) {
					if (appellantStatementNotReceived && statementsDueDate) {
						actions.push('awaitingAppellantStatement');
					} else if (appellantStatementAwaitingReview) {
						actions.push('reviewAppellantStatement');
					}
				}

				if (rule6StatementEnabled && rule6StatementNotReceived) {
					actions.push('awaitingRule6PartyStatement');
				}
				if (rule6StatementEnabled && rule6StatementAwaitingReview) {
					actions.push('reviewRule6PartyStatement');
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
		case APPEAL_CASE_STATUS.COMPLETE:
		case APPEAL_CASE_STATUS.WITHDRAWN: {
			if (appealDetails.costsDecision?.awaitingAppellantCostsDecision) {
				actions.push('issueAppellantCostsDecision');
			}
			if (appealDetails.costsDecision?.awaitingLpaCostsDecision) {
				actions.push('issueLpaCostsDecision');
			}
			break;
		}
		case APPEAL_CASE_STATUS.EVIDENCE: {
			const proofOfEvidenceDueDate =
				appealDetails?.appealTimetable?.proofOfEvidenceAndWitnessesDueDate;
			const proofOfEvidenceDueDatePassed =
				!proofOfEvidenceDueDate ||
				dateIsInThePast(dateISOStringToDayMonthYearHourMinute(proofOfEvidenceDueDate));
			const lpaProofOfEvidenceDone = [
				APPEAL_REPRESENTATION_STATUS.VALID,
				APPEAL_REPRESENTATION_STATUS.INCOMPLETE
			].includes(appealDetails.documentationSummary?.lpaProofOfEvidence?.representationStatus);
			const appellantProofOfEvidenceDone = [
				APPEAL_REPRESENTATION_STATUS.VALID,
				APPEAL_REPRESENTATION_STATUS.INCOMPLETE
			].includes(
				appealDetails.documentationSummary?.appellantProofOfEvidence?.representationStatus
			);
			const lpaProofOfEvidenceReceived =
				appealDetails.documentationSummary?.lpaProofOfEvidence?.status ===
				APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED;
			const appellantProofOfEvidenceReceived =
				appealDetails.documentationSummary?.appellantProofOfEvidence?.status ===
				APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED;

			const rule6PoEEnabled = config.featureFlags.featureFlagRule6PoE;

			const rule6PartyProofOfEvidence = appealDetails.documentationSummary.rule6PartyProofs || {};
			const rule6ProofOfEvidenceRepresentationStatuses = Object.values(
				rule6PartyProofOfEvidence
			).map((poe) => poe.representationStatus);
			const rule6ProofOfEvidenceAwaitingReview = rule6ProofOfEvidenceRepresentationStatuses.some(
				(status) => status === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			);
			const rule6ProofOfEvidenceNotReceived = Object.values(rule6PartyProofOfEvidence).some(
				(item) => item.status === DOCUMENT_STATUS_NOT_RECEIVED
			);

			if (!appellantProofOfEvidenceDone && appellantProofOfEvidenceReceived) {
				actions.push('reviewAppellantProofOfEvidence');
			}
			if (!lpaProofOfEvidenceDone && lpaProofOfEvidenceReceived) {
				actions.push('reviewLpaProofOfEvidence');
			}

			if (proofOfEvidenceDueDatePassed) {
				actions.push('progressToInquiry');
			} else if (!lpaProofOfEvidenceReceived && !appellantProofOfEvidenceReceived) {
				actions.push('awaitingProofOfEvidenceAndWitnesses');
			} else if (!lpaProofOfEvidenceReceived) {
				actions.push('awaitingLpaProofOfEvidenceAndWitnesses');
			} else if (!appellantProofOfEvidenceReceived) {
				actions.push('awaitingAppellantProofOfEvidenceAndWitnesses');
			}

			if (rule6PoEEnabled && rule6ProofOfEvidenceNotReceived) {
				actions.push('awaitingRule6PartyProofOfEvidence');
			}
			if (rule6PoEEnabled && rule6ProofOfEvidenceAwaitingReview) {
				actions.push('reviewRule6PartyProofOfEvidence');
			}

			break;
		}
		default:
			break;
	}

	if (
		isStatePassed(appealDetails, APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE) &&
		isNetResidencesAppealType(appealDetails.appealType) &&
		appealDetails.numberOfResidencesNetChange === null &&
		!isChildAppeal(appealDetails) &&
		appealDetails.appealStatus &&
		![
			APPEAL_CASE_STATUS.INVALID,
			APPEAL_CASE_STATUS.WITHDRAWN,
			APPEAL_CASE_STATUS.TRANSFERRED
			// @ts-ignore
		].includes(appealDetails.appealStatus)
	) {
		actions.push('addResidencesNetChange');
	}

	return actions;
}
