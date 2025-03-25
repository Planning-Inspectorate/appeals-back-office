import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapS106ObligationDue = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 's106-obligation-due-date';
	if (!appealDetails.startedAt) {
		return { id, display: {} };
	}
	return textSummaryListItem({
		id,
		text: 'S106 obligation due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.s106ObligationDueDate),
		link: `${currentRoute}/appeal-timetables/s106-obligation`,
		editable: Boolean(userHasUpdateCasePermission && appealDetails.validAt),
		classes: 's106-obligation-due-date'
	});
};
