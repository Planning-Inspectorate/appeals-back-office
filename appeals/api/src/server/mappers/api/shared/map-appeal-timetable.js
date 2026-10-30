import { isExpeditedAppealType } from '@pins/appeals/utils/appeal-type-checks.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.Timetable} Timetable */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {Timetable|undefined }
 */
export const mapAppealTimetable = (data) => {
	const { appeal } = data;

	const timetable = Array.isArray(appeal.appealTimetable)
		? appeal.appealTimetable[0]
		: appeal.appealTimetable;

	if (!timetable) return undefined;

	if (timetable)
		return {
			appealTimetableId: timetable.id,
			lpaQuestionnaireDueDate:
				(timetable.lpaQuestionnaireDueDate &&
					timetable.lpaQuestionnaireDueDate.toISOString()) ||
				null,
			caseResubmissionDueDate: timetable.caseResubmissionDueDate
				? timetable.caseResubmissionDueDate.toISOString()
				: null,
			...(!isExpeditedAppealType(appeal.appealType?.key || '') && {
				ipCommentsDueDate:
					(timetable.ipCommentsDueDate &&
						timetable.ipCommentsDueDate.toISOString()) ||
					null,
				lpaStatementDueDate:
					(timetable.lpaStatementDueDate &&
						timetable.lpaStatementDueDate.toISOString()) ||
					null,
				finalCommentsDueDate:
					(timetable.finalCommentsDueDate &&
						timetable.finalCommentsDueDate.toISOString()) ||
					null,
				s106ObligationDueDate:
					(timetable.s106ObligationDueDate &&
						timetable.s106ObligationDueDate.toISOString()) ||
					null,
				statementOfCommonGroundDueDate:
					(timetable.statementOfCommonGroundDueDate &&
						timetable.statementOfCommonGroundDueDate.toISOString()) ||
					null,
				planningObligationDueDate:
					(timetable.planningObligationDueDate &&
						timetable.planningObligationDueDate.toISOString()) ||
					null,
				proofOfEvidenceAndWitnessesDueDate:
					(timetable.proofOfEvidenceAndWitnessesDueDate &&
						timetable.proofOfEvidenceAndWitnessesDueDate.toISOString()) ||
					null,
				caseManagementConferenceDueDate:
					(timetable.caseManagementConferenceDueDate &&
						timetable.caseManagementConferenceDueDate.toISOString()) ||
					null
			})
		};
};
