import { findStatusDate, mapDate } from '#utils/mapping/map-dates.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
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

	const representationDates = {
		appellantCommentsSubmittedDate: mapDate(
			appeal.representations?.find(
				(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
			)?.dateCreated ?? null
		),
		appellantStatementSubmittedDate: mapDate(
			appeal.representations?.find(
				(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT
			)?.dateCreated ?? null
		),
		lpaCommentsSubmittedDate: mapDate(
			appeal.representations?.find(
				(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
			)?.dateCreated ?? null
		),
		lpaStatementSubmittedDate: mapDate(
			appeal.representations?.find(
				(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT
			)?.dateCreated ?? null
		)
	};

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
		...representationDates,
		//TODO:
		lpaProofsSubmittedDate: null,
		proofsOfEvidenceDueDate: null,
		siteNoticesSentDate: null
	};
};
