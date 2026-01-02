import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapCaseManagementConferenceDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'case-management-conference-due-date';

	if (
		!appealDetails.startedAt ||
		appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY
	) {
		return { id, display: {} };
	}

	const caseManagementConferenceDueDate =
		appealDetails.appealTimetable?.caseManagementConferenceDueDate;

	return textSummaryListItem({
		id,
		text: 'Case management conference due',
		value: caseManagementConferenceDueDate
			? dateISOStringToDisplayDate(caseManagementConferenceDueDate)
			: 'Not provided',
		link: `${currentRoute}/timetable/edit`,
		editable:
			!isChildAppeal(appealDetails) &&
			userHasUpdateCasePermission &&
			Boolean(appealDetails.startedAt),
		classes: 'appeal-case-management-conference-due-date'
	});
};
