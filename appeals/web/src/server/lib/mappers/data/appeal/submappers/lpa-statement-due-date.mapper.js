import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaStatementDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'lpa-statement-due-date';
	const useNewTimetableRoute = ['Householder', 'Planning appeal'].includes(
		appealDetails.appealType || ''
	);

	if (!appealDetails.startedAt) {
		return { id, display: {} };
	}

	return textSummaryListItem({
		id,
		text: 'LPA statement due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaStatementDueDate),
		link: useNewTimetableRoute
			? `${currentRoute}/timetable/edit`
			: `${currentRoute}/appeal-timetables/lpa-statement`,
		editable:
			userHasUpdateCasePermission && !isStatePassed(appealDetails, APPEAL_CASE_STATUS.STATEMENTS),
		classes: 'appeal-lpa-statement-due-date'
	});
};
