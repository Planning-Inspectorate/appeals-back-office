import { mapDate } from '#utils/mapping/map-dates.js';

/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 * @param {MappingRequest} data
 */
export const mapCaseDates = (data) => {
	const { appeal } = data;

	return {
		caseManagementConferenceDate: mapDate(appeal.appealTimetable?.caseManagementConferenceDueDate),
		statementDueDate: mapDate(appeal.appealTimetable?.lpaStatementDueDate),
		proofsOfEvidenceDueDate: mapDate(appeal.appealTimetable?.proofOfEvidenceAndWitnessesDueDate),
		finalCommentsDueDate: mapDate(appeal.appealTimetable?.finalCommentsDueDate),
		interestedPartyRepsDueDate: mapDate(appeal.appealTimetable?.ipCommentsDueDate),
		statementOfCommonGroundDueDate: mapDate(appeal.appealTimetable?.statementOfCommonGroundDueDate),
		planningObligationDueDate: mapDate(appeal.appealTimetable?.planningObligationDueDate)
	};
};
