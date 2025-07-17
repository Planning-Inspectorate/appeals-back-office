import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import {
	DOCUMENT_STATUS_RECEIVED
	// @ts-ignore
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

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
	const useNewTimetableRoute = [
		APPEAL_TYPE.HOUSEHOLDER,
		APPEAL_TYPE.S78,
		APPEAL_TYPE.PLANNED_LISTED_BUILDING
	].includes(appealDetails.appealType || '');

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
