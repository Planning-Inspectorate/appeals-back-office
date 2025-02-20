import { findStatusDate, mapDate } from '#utils/mapping/map-dates.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

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

	const lpaqValidationDate =
		findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.STATEMENTS) ??
		findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT) ??
		findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.AWAITING_EVENT);

	return {
		finalCommentsDueDate: mapDate(appeal.appealTimetable?.finalCommentsDueDate),
		interestedPartyRepsDueDate: mapDate(appeal.appealTimetable?.ipCommentsDueDate),
		statementDueDate: mapDate(appeal.appealTimetable?.lpaStatementDueDate),
		lpaQuestionnairePublishedDate: lpaqValidationDate,
		lpaQuestionnaireValidationOutcomeDate: lpaqValidationDate,
		//TODO:
		appellantCommentsSubmittedDate: null,
		appellantStatementSubmittedDate: null,
		lpaCommentsSubmittedDate: null,
		lpaProofsSubmittedDate: null,
		lpaStatementSubmittedDate: null,
		proofsOfEvidenceDueDate: null,
		siteNoticesSentDate: null
	};
};
