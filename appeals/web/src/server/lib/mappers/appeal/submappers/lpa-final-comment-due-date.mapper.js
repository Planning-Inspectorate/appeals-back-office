import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaFinalCommentDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'lpa-final-comment-due-date',
		text: 'LPA final comments due',
		// @ts-ignore
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaFinalCommentDueDate) || '',
		link: `${currentRoute}/lpa-case/valid/date`,
		userHasEditPermission: Boolean(userHasUpdateCasePermission && appealDetails.validAt),
		classes: 'appeal-lpa-final-comment-due-date'
	});
