import { calculateIssueDecisionDeadline } from '#endpoints/appeals/appeals.service.js';
import { currentStatus } from '#utils/current-status.js';
import { formatCostsDecision } from '#utils/format-costs-decision.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { add, addBusinessDays } from 'date-fns';

/** @typedef {import('@pins/appeals').CostsDecision} CostsDecision */
/** @typedef {import('#repositories/appeal-lists.repository.js').DBAppeals} DBAppeals */
/** @typedef {DBAppeals[0]} DBAppeal */
/** @typedef {import('#repositories/appeal-lists.repository.js').DBUserAppeal} DBUserAppeal */

const approxStageCompletion = {
	STATE_TARGET_READY_TO_START: 5,
	STATE_TARGET_LPA_QUESTIONNAIRE_DUE: 10,
	STATE_TARGET_ASSIGN_CASE_OFFICER: 15,
	STATE_TARGET_ISSUE_DETERMINATION: 30,
	STATE_TARGET_ISSUE_DETERMINATION_AFTER_SITE_VISIT: 40,
	STATE_TARGET_STATEMENT_REVIEW: 55,
	STATE_TARGET_FINAL_COMMENT_REVIEW: 60
};

/**
 * Map each appeal to include a due date.
 * @param {DBAppeal | DBUserAppeal} appeal
 * @returns {Promise<Date | null | undefined>}
 */
export const calculateDueDate = async (appeal) => {
	switch (currentStatus(appeal)) {
		case APPEAL_CASE_STATUS.READY_TO_START:
			if (
				appeal.appellantCase?.appellantCaseValidationOutcome?.name === 'Incomplete' &&
				appeal.caseExtensionDate
			) {
				return new Date(appeal.caseExtensionDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_READY_TO_START
			});
		case APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE:
			if (appeal.appealTimetable?.lpaQuestionnaireDueDate) {
				return new Date(appeal.appealTimetable?.lpaQuestionnaireDueDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_LPA_QUESTIONNAIRE_DUE
			});
		case APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER:
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_ASSIGN_CASE_OFFICER
			});
		case APPEAL_CASE_STATUS.VALIDATION:
			return new Date(appeal.caseCreatedDate);
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION: {
			if (appeal.siteVisit) {
				return await calculateIssueDecisionDeadline(
					new Date(appeal.siteVisit.visitEndTime || appeal.siteVisit.visitDate || 0),
					approxStageCompletion.STATE_TARGET_ISSUE_DETERMINATION_AFTER_SITE_VISIT
				);
			}
			return await calculateIssueDecisionDeadline(
				new Date(appeal.caseCreatedDate),
				approxStageCompletion.STATE_TARGET_ISSUE_DETERMINATION
			);
		}
		case APPEAL_CASE_STATUS.COMPLETE: {
			const costsDecision = await formatCostsDecision(appeal);
			if (
				costsDecision?.awaitingAppellantCostsDecision ||
				costsDecision?.awaitingLpaCostsDecision
			) {
				const appealStatus = appeal.appealStatus.find(
					(state) => state.status === APPEAL_CASE_STATUS.COMPLETE
				);
				return addBusinessDays(new Date(appealStatus?.createdAt || ''), 5);
			}
			return null;
		}
		case APPEAL_CASE_STATUS.STATEMENTS: {
			if (
				appeal.appealTimetable?.lpaStatementDueDate &&
				appeal.appealTimetable?.ipCommentsDueDate
			) {
				const lpaDate = new Date(appeal.appealTimetable.lpaStatementDueDate);
				const ipDate = new Date(appeal.appealTimetable.ipCommentsDueDate);

				return lpaDate < ipDate ? lpaDate : ipDate;
			}
			if (appeal.appealTimetable?.lpaStatementDueDate) {
				return new Date(appeal.appealTimetable?.lpaStatementDueDate);
			}
			if (appeal.appealTimetable?.ipCommentsDueDate) {
				return new Date(appeal.appealTimetable?.ipCommentsDueDate);
			}
			if (appeal.appealTimetable?.appellantStatementDueDate) {
				return new Date(appeal.appealTimetable?.appellantStatementDueDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_STATEMENT_REVIEW
			});
		}
		case APPEAL_CASE_STATUS.FINAL_COMMENTS: {
			if (appeal.appealTimetable?.finalCommentsDueDate) {
				return new Date(appeal.appealTimetable?.finalCommentsDueDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_FINAL_COMMENT_REVIEW
			});
		}
		case APPEAL_CASE_STATUS.AWAITING_EVENT: {
			if (appeal.procedureType?.key === APPEAL_CASE_PROCEDURE.HEARING) {
				return appeal.hearing ? new Date(appeal.hearing?.hearingStartTime || 0) : undefined;
			}
			return appeal.siteVisit ? new Date(appeal.siteVisit?.visitDate || 0) : undefined;
		}
		case APPEAL_CASE_STATUS.EVENT: {
			return new Date(
				appeal.appealTimetable?.finalCommentsDueDate ||
					appeal.appealTimetable?.lpaQuestionnaireDueDate ||
					0
			);
		}
		case APPEAL_CASE_STATUS.AWAITING_TRANSFER: {
			const appealStatus = appeal.appealStatus.find(
				(state) => state.status === APPEAL_CASE_STATUS.AWAITING_TRANSFER
			);
			return addBusinessDays(new Date(appealStatus?.createdAt || ''), 5);
		}
		default: {
			return undefined;
		}
	}
};
