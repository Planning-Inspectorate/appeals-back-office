import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapIpCommentsDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'ip-comments-due-date';
	const useNewTimetableRoute = ['Householder', 'Planning appeal'].includes(
		appealDetails.appealType || ''
	);
	if (!appealDetails.startedAt) {
		return { id, display: {} };
	}

	return textSummaryListItem({
		id,
		text: 'Interested party comments due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.ipCommentsDueDate),
		link: useNewTimetableRoute
			? `${currentRoute}/timetable/edit`
			: `${currentRoute}/appeal-timetables/ip-comments`,
		editable:
			(useNewTimetableRoute
				? !isStatePassed(appealDetails, APPEAL_CASE_STATUS.STATEMENTS)
				: !appealDetails.documentationSummary.ipComments?.counts?.published) &&
			userHasUpdateCasePermission &&
			Boolean(appealDetails.startedAt),
		classes: 'appeal-ip-comments-due-date'
	});
};
