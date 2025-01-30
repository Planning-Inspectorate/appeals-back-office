import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import formatAddress from '#utils/format-address.js';
import isFPA from '#utils/is-fpa.js';
import {
	formatAppellantCaseDocumentationStatus,
	formatLpaQuestionnaireDocumentationStatus,
	formatLpaStatementStatus
} from '#utils/format-documentation-status.js';
import { add } from 'date-fns';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { DOCUMENT_STATUS_NOT_RECEIVED, DOCUMENT_STATUS_RECEIVED } from '#endpoints/constants.js';

const approxStageCompletion = {
	STATE_TARGET_READY_TO_START: 5,
	STATE_TARGET_LPA_QUESTIONNAIRE_DUE: 10,
	STATE_TARGET_ASSIGN_CASE_OFFICER: 15,
	STATE_TARGET_ISSUE_DETERMINATION: 30,
	STATE_TARGET_STATEMENT_REVIEW: 55,
	STATE_TARGET_FINAL_COMMENT_REVIEW: 60
};

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */
/** @typedef {import('@pins/appeals.api').Schema.AppealRelationship} AppealRelationship */
/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/** @typedef {import('@pins/appeals.api').Appeals.AppealListResponse} AppealListResponse */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppealDetailsResponse} SingleAppealDetailsResponse */
/** @typedef {import('#endpoints/appeals').DocumentationSummary} DocumentationSummary */
/** @typedef {import('#db-client').AppealStatus} AppealStatus */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */

/**
 * @param {Appeal} appeal
 * @param {AppealRelationship[]} linkedAppeals
 * @param {Record<string, number>} commentCounts
 * @returns {AppealListResponse}}
 */
const formatAppeals = (appeal, linkedAppeals, commentCounts) => ({
	appealId: appeal.id,
	appealReference: appeal.reference,
	appealSite: formatAddress(appeal.address),
	appealStatus: appeal.appealStatus[0].status,
	appealType: appeal.appealType?.type,
	createdAt: appeal.caseCreatedDate,
	localPlanningDepartment: appeal.lpa?.name || '',
	dueDate: null,
	documentationSummary: formatDocumentationSummary(appeal),
	isParentAppeal: linkedAppeals.filter((link) => link.parentRef === appeal.reference).length > 0,
	isChildAppeal: linkedAppeals.filter((link) => link.childRef === appeal.reference).length > 0,
	commentCounts
});

/**
 * @param {Appeal} appeal
 * @param {AppealRelationship[]} linkedAppeals
 * @param {Record<string, number>} commentCounts
 * @returns {AppealListResponse}}
 */
const formatMyAppeals = (appeal, linkedAppeals, commentCounts) => ({
	appealId: appeal.id,
	appealReference: appeal.reference,
	appealSite: formatAddress(appeal.address),
	appealStatus: appeal.appealStatus[0].status,
	appealType: appeal.appealType?.type,
	createdAt: appeal.caseCreatedDate,
	localPlanningDepartment: appeal.lpa?.name || '',
	lpaQuestionnaireId: appeal.lpaQuestionnaire?.id || null,
	documentationSummary: formatDocumentationSummary(appeal),
	dueDate: mapAppealToDueDate(
		appeal,
		appeal.appellantCase?.appellantCaseValidationOutcome?.name || '',
		appeal.caseExtensionDate
	),
	appealTimetable: appeal.appealTimetable
		? {
				appealTimetableId: appeal.appealTimetable.id,
				lpaQuestionnaireDueDate:
					appeal.appealTimetable.lpaQuestionnaireDueDate?.toISOString() || null,
				caseResubmissionDueDate:
					appeal.appealTimetable.caseResubmissionDueDate?.toISOString() || null,
				...(isFPA(appeal.appealType?.key || '') && {
					ipCommentsDueDate: appeal.appealTimetable.ipCommentsDueDate?.toISOString() || null,
					appellantStatementDueDate:
						appeal.appealTimetable.appellantStatementDueDate?.toISOString() || null,
					lpaStatementDueDate: appeal.appealTimetable.lpaStatementDueDate?.toISOString() || null,
					appellantFinalCommentsDueDate:
						appeal.appealTimetable.appellantFinalCommentsDueDate?.toISOString() || null,
					lpaFinalCommentsDueDate:
						appeal.appealTimetable.lpaFinalCommentsDueDate?.toISOString() || null,
					s106ObligationDueDate:
						appeal.appealTimetable.s106ObligationDueDate?.toISOString() || null,
					issueDeterminationDate:
						appeal.appealTimetable.issueDeterminationDate?.toISOString() || null
				})
		  }
		: undefined,
	isParentAppeal: linkedAppeals.filter((link) => link.parentRef === appeal.reference).length > 0,
	isChildAppeal: linkedAppeals.filter((link) => link.childRef === appeal.reference).length > 0,
	commentCounts
});

/**
 * @param {Appeal} appeal
 * @returns {DocumentationSummary}
 * */
const formatDocumentationSummary = (appeal) => {
	const lpaStatement = appeal.representations?.find(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT
	);
	const lpaFinalComments = appeal.representations?.find(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
	);
	const appellantFinalComments = appeal.representations?.find(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
	);

	return {
		appellantCase: {
			status: formatAppellantCaseDocumentationStatus(appeal),
			dueDate: appeal.caseExtensionDate && appeal.caseExtensionDate?.toISOString(),
			receivedAt: appeal.caseCreatedDate.toISOString()
		},
		lpaQuestionnaire: {
			status: formatLpaQuestionnaireDocumentationStatus(appeal),
			dueDate:
				appeal.appealTimetable?.lpaQuestionnaireDueDate &&
				appeal.appealTimetable?.lpaQuestionnaireDueDate.toISOString(),
			receivedAt:
				appeal.lpaQuestionnaire?.lpaqCreatedDate &&
				appeal.lpaQuestionnaire?.lpaqCreatedDate.toISOString()
		},
		ipComments: {
			status: appeal.representations?.length
				? DOCUMENT_STATUS_RECEIVED
				: DOCUMENT_STATUS_NOT_RECEIVED
		},
		lpaStatement: {
			status: formatLpaStatementStatus(lpaStatement ?? null),
			receivedAt: lpaStatement?.dateCreated
		},
		lpaFinalComments: {
			status: lpaFinalComments ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
			receivedAt: lpaFinalComments
				? lpaFinalComments?.dateCreated && lpaFinalComments?.dateCreated.toISOString()
				: null,
			representationStatus: lpaFinalComments ? lpaFinalComments.status : null
		},
		appellantFinalComments: {
			status: appellantFinalComments ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED,
			receivedAt: appellantFinalComments
				? appellantFinalComments?.dateCreated && appellantFinalComments?.dateCreated.toISOString()
				: null,
			representationStatus: appellantFinalComments ? appellantFinalComments.status : null
		}
	};
};

/**
 * Map each appeal to include a due date.
 * @param {Appeal} appeal
 * @param {string} appellantCaseStatus
 * @param {Date | null} appellantCaseDueDate
 * @returns { Date | null | undefined }
 */
export const mapAppealToDueDate = (appeal, appellantCaseStatus, appellantCaseDueDate) => {
	switch (appeal.appealStatus[0].status) {
		case APPEAL_CASE_STATUS.READY_TO_START:
			if (appellantCaseStatus == 'Incomplete' && appellantCaseDueDate) {
				return new Date(appellantCaseDueDate);
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
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION: {
			if (appeal.appealTimetable?.issueDeterminationDate) {
				return new Date(appeal.appealTimetable?.issueDeterminationDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_ISSUE_DETERMINATION
			});
		}
		case APPEAL_CASE_STATUS.COMPLETE: {
			return null;
		}
		case APPEAL_CASE_STATUS.STATEMENTS: {
			if (appeal.appealTimetable?.appellantStatementDueDate) {
				return new Date(appeal.appealTimetable?.appellantStatementDueDate);
			}
			if (appeal.appealTimetable?.lpaStatementDueDate) {
				return new Date(appeal.appealTimetable?.lpaStatementDueDate);
			}
			if (appeal.appealTimetable?.ipCommentsDueDate) {
				return new Date(appeal.appealTimetable?.ipCommentsDueDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_STATEMENT_REVIEW
			});
		}
		case APPEAL_CASE_STATUS.FINAL_COMMENTS: {
			if (appeal.appealTimetable?.appellantFinalCommentsDueDate) {
				return new Date(appeal.appealTimetable?.appellantFinalCommentsDueDate);
			}
			if (appeal.appealTimetable?.lpaFinalCommentsDueDate) {
				return new Date(appeal.appealTimetable?.lpaFinalCommentsDueDate);
			}
			return add(new Date(appeal.caseCreatedDate), {
				days: approxStageCompletion.STATE_TARGET_FINAL_COMMENT_REVIEW
			});
		}
		default: {
			return undefined;
		}
	}
};

/**
 * @param {AppealRelationship[]} otherAppeals
 * @param {string} currentAppealRef
 * @returns {number[]}
 */
const getIdsOfReferencedAppeals = (otherAppeals, currentAppealRef) => {
	/**
	 * @type {number[]}
	 */
	const relevantIds = [];
	otherAppeals.map((relation) => {
		if (
			relation.childRef === currentAppealRef &&
			relation.parentId &&
			relation.parentId !== null &&
			relevantIds.indexOf(relation.parentId) === -1
		) {
			relevantIds.push(relation.parentId);
		}
		if (
			relation.parentRef === currentAppealRef &&
			relation.childId &&
			relation.childId !== null &&
			relevantIds.indexOf(relation.childId) === -1
		) {
			relevantIds.push(relation.childId);
		}
	});

	return relevantIds;
};

export { formatAppeals, formatMyAppeals, getIdsOfReferencedAppeals };
