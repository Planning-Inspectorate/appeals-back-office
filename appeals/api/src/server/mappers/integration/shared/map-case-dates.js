import { isCaseInvalid } from '#utils/case-invalid.js';
import { findStatusDate, mapDate } from '#utils/mapping/map-dates.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

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

	const appellantCaseValidationDate = isCaseInvalid(appeal.appealStatus)
		? findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START)
		: (findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.INVALID) ??
			findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START));

	const lpaqValidationDate =
		findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT) ??
		findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.AWAITING_EVENT);

	return {
		applicationDate: mapDate(appeal.appellantCase?.applicationDate),
		applicationDecisionDate: mapDate(appeal.appellantCase?.applicationDecisionDate),
		caseSubmittedDate: mapDate(appeal.appellantCase?.caseSubmittedDate),
		caseSubmissionDueDate: mapDate(appeal.appellantCase?.caseSubmissionDueDate),
		caseCreatedDate: mapDate(appeal.caseCreatedDate),
		caseUpdatedDate: mapDate(appeal.caseUpdatedDate),
		caseValidDate: mapDate(appeal.caseValidDate),
		caseValidationDate: appellantCaseValidationDate,
		caseExtensionDate: mapDate(appeal.caseExtensionDate),
		caseStartedDate: mapDate(appeal.caseStartedDate),
		casePublishedDate: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START),
		lpaQuestionnaireCreatedDate: mapDate(appeal.lpaQuestionnaire?.lpaqCreatedDate),
		lpaQuestionnaireSubmittedDate: mapDate(appeal.lpaQuestionnaire?.lpaQuestionnaireSubmittedDate),
		lpaQuestionnaireDueDate: mapDate(appeal.appealTimetable?.lpaQuestionnaireDueDate),
		lpaQuestionnairePublishedDate: lpaqValidationDate,
		lpaQuestionnaireValidationOutcomeDate: lpaqValidationDate,
		caseWithdrawnDate: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.WITHDRAWN),
		caseTransferredDate: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.TRANSFERRED),
		transferredCaseClosedDate: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.CLOSED),
		caseDecisionOutcomeDate: mapDate(appeal.inspectorDecision?.caseDecisionOutcomeDate),
		caseDecisionPublishedDate: null,
		caseCompletedDate: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.COMPLETE)
	};
};
