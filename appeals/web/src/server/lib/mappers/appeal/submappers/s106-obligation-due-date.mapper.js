import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapS106ObligationDue = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 's106-obligation-due-date',
		text: 'S106 obligation due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.s106ObligationDueDate),
		link: `${currentRoute}/appeal-timetables/s106-obligation`,
		editable: Boolean(userHasUpdateCasePermission && appealDetails.validAt),
		classes: 's106-obligation-due-date'
	});
