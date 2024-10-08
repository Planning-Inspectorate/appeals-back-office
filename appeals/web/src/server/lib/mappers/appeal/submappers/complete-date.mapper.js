import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCompleteDate = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'complete-date',
		text: 'Complete',
		value:
			dateISOStringToDisplayDate(appealDetails.appealTimetable?.completeDate) ||
			'Due date not yet set',
		link: `${currentRoute}/change-appeal-details/complete-date`,
		userHasEditPermission: userHasUpdateCasePermission,
		classes: 'appeal-complete-date',
		actionText: appealDetails.appealTimetable?.completeDate ? 'Change' : 'Schedule'
	});
