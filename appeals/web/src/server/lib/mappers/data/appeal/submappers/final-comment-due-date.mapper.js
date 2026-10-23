import { isStatePassed } from '#lib/appeal-status.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { displayFinalComments } from '@pins/appeals/utils/business-rules.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { mapDueDateSummaryListItem } from './utils/due-date-mapper-helper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapFinalCommentDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'final-comments-due-date';

	const isGeneric = isGenericAppealType(appealDetails.appealType);

	// if it is an enforcement, ELB, LDC or discontinuance appeal we have final comments for all procedure types
	// otherwise we only have final comments for written procedure type
	if (
		!appealDetails.startedAt ||
		(!isGeneric &&
			!displayFinalComments(
				appealDetails.appealType ?? undefined,
				appealDetails.procedureType ?? undefined
			))
	) {
		return { id, display: {} };
	}

	const editable =
		!isChildAppeal(appealDetails) &&
		userHasUpdateCasePermission &&
		(isGeneric
			? appealDetails.appealStatus !== APPEAL_CASE_STATUS.COMPLETE
			: !isStatePassed(appealDetails, APPEAL_CASE_STATUS.FINAL_COMMENTS));

	return mapDueDateSummaryListItem({
		id,
		text: 'Final comments due',
		dueDate: appealDetails.appealTimetable?.finalCommentsDueDate,
		appealDetails,
		currentRoute,
		editable,
		classes: 'appeal-final-comments-due-date'
	});
};
