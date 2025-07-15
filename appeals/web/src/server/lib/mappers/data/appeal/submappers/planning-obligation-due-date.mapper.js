import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { APPEAL_CASE_PROCEDURE } from 'pins-data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapPlanningObligationDueDate = ({
	appealDetails,
	appellantCase,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'planning-obligation-due-date';

	if (
		!appealDetails.startedAt ||
		![APPEAL_CASE_PROCEDURE.HEARING, APPEAL_CASE_PROCEDURE.INQUIRY].includes(
			appealDetails.procedureType?.toLowerCase() ?? ''
		) ||
		!appellantCase?.planningObligation?.hasObligation
	) {
		return { id, display: {} };
	}

	const planningObligationDueDate = appealDetails.appealTimetable?.planningObligationDueDate;

	return textSummaryListItem({
		id,
		text: 'Planning obligation due',
		value: planningObligationDueDate
			? dateISOStringToDisplayDate(planningObligationDueDate)
			: 'Not provided',
		link: `${currentRoute}/timetable/edit`,
		editable: userHasUpdateCasePermission && Boolean(appealDetails.startedAt),
		classes: 'appeal-planning-obligation-due-date'
	});
};
