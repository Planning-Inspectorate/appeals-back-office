import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaFinalCommentDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'lpa-final-comment-due-date',
		text: 'LPA final comments due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaFinalCommentsDueDate),
		link: `${currentRoute}/appeal-timetables/lpa-final-comments`,
		editable: Boolean(userHasUpdateCasePermission && appealDetails.validAt),
		classes: 'appeal-lpa-final-comment-due-date'
	});
