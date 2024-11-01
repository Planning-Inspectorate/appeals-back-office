import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaStatementDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'lpa-statement-due-date',
		text: 'LPA statement due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaStatementDueDate),
		link: `${currentRoute}/appeal-timetables/lpa-statement`,
		editable: Boolean(userHasUpdateCasePermission && appealDetails.validAt),
		classes: 'appeal-lpa-statement-due-date'
	});
