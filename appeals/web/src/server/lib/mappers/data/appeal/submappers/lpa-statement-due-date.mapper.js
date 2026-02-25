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

	if (!appealDetails.startedAt) {
		return { id, display: {} };
	}

	const text =
		appealDetails.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE ||
		appealDetails.appealType === APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
			? 'Statements due'
			: 'LPA statement due';

	return textSummaryListItem({
		id,
		text,
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaStatementDueDate),
		link: `${currentRoute}/timetable/edit`,
		editable:
			!isChildAppeal(appealDetails) &&
			userHasUpdateCasePermission &&
			!isStatePassed(appealDetails, APPEAL_CASE_STATUS.STATEMENTS),
		classes: 'appeal-lpa-statement-due-date'
	});
};
