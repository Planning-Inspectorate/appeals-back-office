import { isStatePassed } from '#lib/appeal-status.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { APPEAL_TYPE, PROCEDURE_TYPE_NAME } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaStatementDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'lpa-statement-due-date';

	if (
		!appealDetails.startedAt ||
		appealDetails.procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 ||
		appealDetails.procedureType === PROCEDURE_TYPE_NAME.WRITTEN_PART_1
	) {
		return { id, display: {} };
	}

	const text =
		appealDetails.appealType === APPEAL_TYPE.ADVERTISEMENT ||
		appealDetails.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE ||
		appealDetails.appealType === APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING ||
		appealDetails.appealType === APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE
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
