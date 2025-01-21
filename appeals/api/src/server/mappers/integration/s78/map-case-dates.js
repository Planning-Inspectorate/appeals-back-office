import { mapDate } from '#utils/mapping/map-dates.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.AppealStatus} AppealStatus */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns
 */
export const mapCaseDates = (data) => {
	const { appeal } = data;

	return {
		//TODO:
		appellantCommentsSubmittedDate: null,
		appellantStatementSubmittedDate: null,
		finalCommentsDueDate: mapDate(appeal.appealTimetable?.lpaFinalCommentsDueDate),
		interestedPartyRepsDueDate: mapDate(appeal.appealTimetable?.ipCommentsDueDate),
		lpaCommentsSubmittedDate: null,
		lpaProofsSubmittedDate: null,
		lpaStatementSubmittedDate: null,
		proofsOfEvidenceDueDate: null,
		siteNoticesSentDate: null,
		statementDueDate: mapDate(appeal.appealTimetable?.lpaStatementDueDate)
	};
};
