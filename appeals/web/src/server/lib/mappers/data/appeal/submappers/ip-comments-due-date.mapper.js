import { isStatePassed } from '#lib/appeal-status.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { isS78ExpeditedAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapIpCommentsDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission,
	appellantCase
}) => {
	const id = 'ip-comments-due-date';

	if (
		!appealDetails.startedAt ||
		isS78ExpeditedAppealType(
			appealDetails.appealType,
			appellantCase?.applicationDate,
			appellantCase?.applicationDecision,
			appellantCase?.typeOfPlanningApplication
		)
	) {
		return { id, display: {} };
	}

	return textSummaryListItem({
		id,
		text: 'Interested party comments due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.ipCommentsDueDate),
		link: `${currentRoute}/timetable/edit`,
		editable:
			!isChildAppeal(appealDetails) &&
			!isStatePassed(appealDetails, APPEAL_CASE_STATUS.STATEMENTS) &&
			userHasUpdateCasePermission &&
			Boolean(appealDetails.startedAt),
		classes: 'appeal-ip-comments-due-date'
	});
};
