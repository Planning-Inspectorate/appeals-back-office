import isFPA from '#utils/is-fpa.js';

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

	if (appeal.appealTimetable)
		return {
			appealTimetableId: appeal.appealTimetable.id,
			lpaQuestionnaireDueDate:
				(appeal.appealTimetable.lpaQuestionnaireDueDate &&
					appeal.appealTimetable.lpaQuestionnaireDueDate.toISOString()) ||
				null,
			caseResubmissionDueDate: appeal.appealTimetable.caseResubmissionDueDate
				? appeal.appealTimetable.caseResubmissionDueDate.toISOString()
				: null,
			...(isFPA(appeal.appealType?.key || '') && {
				ipCommentsDueDate:
					(appeal.appealTimetable.ipCommentsDueDate &&
						appeal.appealTimetable.ipCommentsDueDate.toISOString()) ||
					null,
				appellantStatementDueDate:
					(appeal.appealTimetable.appellantStatementDueDate &&
						appeal.appealTimetable.appellantStatementDueDate.toISOString()) ||
					null,
				lpaStatementDueDate:
					(appeal.appealTimetable.lpaStatementDueDate &&
						appeal.appealTimetable.lpaStatementDueDate.toISOString()) ||
					null,
				finalCommentsDueDate:
					(appeal.appealTimetable.finalCommentsDueDate &&
						appeal.appealTimetable.finalCommentsDueDate.toISOString()) ||
					null
			}),
			...(appeal.procedureType?.key === 'written' && {
				s106ObligationDueDate:
					(appeal.appealTimetable.s106ObligationDueDate &&
						appeal.appealTimetable.s106ObligationDueDate.toISOString()) ||
					null
			}),
			...(appeal.procedureType?.key === 'hearing' && {
				hearingDate:
					(appeal.appealTimetable.hearingDate &&
						appeal.appealTimetable.hearingDate.toISOString()) ||
					null,
				planningObligationDueDate:
					(appeal.appealTimetable.planningObligationDueDate &&
						appeal.appealTimetable.planningObligationDueDate.toISOString()) ||
					null
			})
		};
};
