import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapIssueDeterminationDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'issue-determination',
		text: 'Issue determination',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.issueDeterminationDate),
		link: `${currentRoute}/appeal-timetables/issue-determination`,
		editable: userHasUpdateCasePermission,
		actionText: appealDetails.appealTimetable?.issueDeterminationDate ? 'Change' : 'Schedule',
		classes: 'appeal-issue-determination'
	});
