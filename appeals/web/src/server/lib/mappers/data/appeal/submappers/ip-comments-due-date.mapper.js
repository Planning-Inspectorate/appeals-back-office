import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapIpCommentsDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'ip-comments-due-date';
	if (!appealDetails.startedAt) {
		return { id, display: {} };
	}
	return textSummaryListItem({
		id,
		text: 'Interested party comments due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.ipCommentsDueDate),
		link: `${currentRoute}/appeal-timetables/ip-comments`,
		editable:
			!appealDetails.documentationSummary.ipComments?.counts?.published &&
			userHasUpdateCasePermission &&
			Boolean(appealDetails.startedAt),
		classes: 'appeal-ip-comments-due-date'
	});
};
