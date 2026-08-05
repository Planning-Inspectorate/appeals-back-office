import { isStatePassed } from '#lib/appeal-status.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { displayFinalComments } from '@pins/appeals/utils/business-rules.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapFinalCommentDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'final-comments-due-date';

	// if it is an enforcement, ELB, LDC or discontinuance appeal we have final comments for all procedure types
	// otherwise we only have final comments for written procedure type
	if (
		!appealDetails.startedAt ||
		!displayFinalComments(
			appealDetails.appealType ?? undefined,
			appealDetails.procedureType ?? undefined
		)
	) {
		return { id, display: {} };
	}
	return textSummaryListItem({
		id,
		text: 'Final comments due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.finalCommentsDueDate),
		link: `${currentRoute}/timetable/edit`,
		editable:
			!isChildAppeal(appealDetails) &&
			userHasUpdateCasePermission &&
			!isStatePassed(appealDetails, APPEAL_CASE_STATUS.FINAL_COMMENTS),
		classes: 'appeal-final-comments-due-date'
	});
};
