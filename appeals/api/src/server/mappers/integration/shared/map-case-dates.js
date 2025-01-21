import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { mapDate, findStatusDate } from '#utils/mapping/map-dates.js';

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
		applicationDate: mapDate(appeal.appellantCase?.applicationDate),
		applicationDecisionDate: mapDate(appeal.appellantCase?.applicationDecisionDate),
		caseSubmittedDate: mapDate(appeal.appellantCase?.caseSubmittedDate),
		caseSubmissionDueDate: mapDate(appeal.appellantCase?.caseSubmissionDueDate),
		caseCreatedDate: mapDate(appeal.caseCreatedDate),
		caseUpdatedDate: mapDate(appeal.caseUpdatedDate),
		caseValidDate: mapDate(appeal.caseValidDate),
		caseValidationDate: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START),
		caseExtensionDate: mapDate(appeal.caseExtensionDate),
		caseStartedDate: mapDate(appeal.caseStartedDate),
		casePublishedDate: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START),
		lpaQuestionnaireCreatedDate: mapDate(appeal.lpaQuestionnaire?.lpaqCreatedDate),
		lpaQuestionnaireSubmittedDate: mapDate(appeal.lpaQuestionnaire?.lpaQuestionnaireSubmittedDate),
		lpaQuestionnaireDueDate: mapDate(appeal.appealTimetable?.lpaQuestionnaireDueDate),
		lpaQuestionnairePublishedDate: findStatusDate(
			appeal.appealStatus,
			APPEAL_CASE_STATUS.ISSUE_DETERMINATION
		),
		lpaQuestionnaireValidationOutcomeDate: findStatusDate(
			appeal.appealStatus,
			APPEAL_CASE_STATUS.ISSUE_DETERMINATION
		),
		caseWithdrawnDate: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.WITHDRAWN),
		caseTransferredDate: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.TRANSFERRED),
		transferredCaseClosedDate: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.CLOSED),
		caseDecisionOutcomeDate: mapDate(appeal.inspectorDecision?.caseDecisionOutcomeDate),
		caseDecisionPublishedDate: null,
		caseCompletedDate: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.COMPLETE)
	};
};
