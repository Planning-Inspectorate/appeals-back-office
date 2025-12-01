import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import {
	DOCUMENT_STATUS_RECEIVED
	// @ts-ignore
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

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
	let editable =
		!isChildAppeal(appealDetails) && Boolean(userHasUpdateCasePermission && appealDetails.validAt);
	const lpaQuestionnaireStatus = appealDetails.documentationSummary.lpaQuestionnaire?.status;

	if (
		(lpaQuestionnaireStatus && lpaQuestionnaireStatus === DOCUMENT_STATUS_RECEIVED) ||
		appealDetails.appealStatus !== APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
	) {
		editable = false;
	}

	return textSummaryListItem({
		id,
		text: 'LPA questionnaire due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaQuestionnaireDueDate),
		link: `${currentRoute}/timetable/edit`,
		editable,
		classes: 'appeal-lpa-questionnaire-due-date'
	});
};
