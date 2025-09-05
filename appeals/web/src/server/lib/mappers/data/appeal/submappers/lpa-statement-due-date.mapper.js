import { isStatePassed } from '#lib/appeal-status.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaStatementDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'lpa-statement-due-date';
	const useNewTimetableRoute = [
		APPEAL_TYPE.HOUSEHOLDER,
		APPEAL_TYPE.S78,
		APPEAL_TYPE.PLANNED_LISTED_BUILDING
	].includes(appealDetails.appealType || '');

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
			!isChildAppeal(appealDetails) &&
			userHasUpdateCasePermission &&
			!isStatePassed(appealDetails, APPEAL_CASE_STATUS.STATEMENTS),
		classes: 'appeal-lpa-statement-due-date'
	});
};
