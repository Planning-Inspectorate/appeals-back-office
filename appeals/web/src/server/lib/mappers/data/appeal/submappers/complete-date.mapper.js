import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCompleteDate = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'complete-date',
		text: 'Complete',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.completeDate),
		link: `${currentRoute}/change-appeal-details/complete-date`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-complete-date',
		actionText: appealDetails.appealTimetable?.completeDate ? 'Change' : 'Schedule'
	});
