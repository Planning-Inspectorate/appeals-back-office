import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapIpCommentsDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'ip-comments-due-date',
		text: 'Interested party comments due',
		// @ts-ignore
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.ipCommentsDueDate) || '',
		link: `${currentRoute}/appellant-case/valid/date`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-ip-comments-due-date'
	});
