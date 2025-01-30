import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaFinalCommentDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission,
	lpaFinalComments
}) => {
	const commentNotAccepted = lpaFinalComments?.status !== APPEAL_REPRESENTATION_STATUS.VALID;

	return textSummaryListItem({
		id: 'lpa-final-comment-due-date',
		text: 'LPA final comments due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaFinalCommentsDueDate),
		link: `${currentRoute}/appeal-timetables/lpa-final-comments`,
		editable: Boolean(commentNotAccepted && userHasUpdateCasePermission && appealDetails.validAt),
		classes: 'appeal-lpa-final-comments-due-date'
	});
};
