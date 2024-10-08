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
		text: 'Comments from interested parties due',
		// @ts-ignore
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.ipCommentsDueDate) || '',
		link: `${currentRoute}/appellant-case/valid/date`,
		userHasEditPermission: userHasUpdateCasePermission,
		classes: 'appeal-ip-comments-due-date'
	});
