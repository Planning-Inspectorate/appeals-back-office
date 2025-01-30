import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantFinalCommentDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission,
	appellantFinalComments
}) => {
	const commentNotAccepted = appellantFinalComments?.status !== APPEAL_REPRESENTATION_STATUS.VALID;

	return textSummaryListItem({
		id: 'appellant-final-comment-due-date',
		text: 'Appellant final comments due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.appellantFinalCommentsDueDate),
		link: `${currentRoute}/appeal-timetables/appellant-final-comments`,
		editable: Boolean(commentNotAccepted && userHasUpdateCasePermission && appealDetails.validAt),
		classes: 'appeal-appellant-final-comments-due-date'
	});
};
