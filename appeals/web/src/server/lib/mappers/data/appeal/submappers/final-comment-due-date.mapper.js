import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapFinalCommentDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission,
	appellantFinalComments
}) => {
	const commentNotAccepted = appellantFinalComments?.status !== APPEAL_REPRESENTATION_STATUS.VALID;

	return textSummaryListItem({
		id: 'final-comments-due-date',
		text: 'Final comments due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.finalCommentsDueDate),
		link: `${currentRoute}/appeal-timetables/final-comments`,
		editable: Boolean(commentNotAccepted && userHasUpdateCasePermission && appealDetails.startedAt),
		classes: 'appeal-final-comments-due-date'
	});
};
