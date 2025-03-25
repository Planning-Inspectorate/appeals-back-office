import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapFinalCommentDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'final-comments-due-date';
	if (!appealDetails.startedAt) {
		return { id, display: {} };
	}
	return textSummaryListItem({
		id,
		text: 'Final comments due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.finalCommentsDueDate),
		link: `${currentRoute}/appeal-timetables/final-comments`,
		editable:
			userHasUpdateCasePermission &&
			!isStatePassed(appealDetails, APPEAL_CASE_STATUS.FINAL_COMMENTS),
		classes: 'appeal-final-comments-due-date'
	});
};
