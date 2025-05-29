import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import {
	DOCUMENT_STATUS_RECEIVED
	// @ts-ignore
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from 'pins-data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaQuestionnaireDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'lpa-questionnaire-due-date';
	if (!appealDetails.startedAt) {
		return { id, display: {} };
	}
	let editable = Boolean(userHasUpdateCasePermission && appealDetails.validAt);
	const lpaQuestionnaireStatus = appealDetails.documentationSummary.lpaQuestionnaire?.status;

	if (
		(lpaQuestionnaireStatus && lpaQuestionnaireStatus === DOCUMENT_STATUS_RECEIVED) ||
		appealDetails.appealStatus !== APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
	) {
		editable = false;
	}
	const useNewTimetableRoute =
		appealDetails.appealType === 'Householder' ||
		(appealDetails.appealType === 'Planning appeal' &&
			appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.WRITTEN);

	return textSummaryListItem({
		id,
		text: 'LPA questionnaire due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaQuestionnaireDueDate),
		link: useNewTimetableRoute
			? `${currentRoute}/timetable/edit`
			: `${currentRoute}/appeal-timetables/lpa-questionnaire`,
		editable,
		classes: 'appeal-lpa-questionnaire-due-date'
	});
};
