import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapStatementOfCommonGroundDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'statement-of-common-ground-due-date';

	if (
		!appealDetails.startedAt ||
		appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.WRITTEN
	) {
		return { id, display: {} };
	}

	return textSummaryListItem({
		id,
		text: 'Statement of common ground due',
		value: dateISOStringToDisplayDate(
			appealDetails.appealTimetable?.statementOfCommonGroundDueDate
		),
		link: `${currentRoute}/timetable/edit`,
		editable:
			!isChildAppeal(appealDetails) &&
			userHasUpdateCasePermission &&
			Boolean(appealDetails.startedAt),
		classes: 'appeal-statement-of-common-ground-due-date'
	});
};
