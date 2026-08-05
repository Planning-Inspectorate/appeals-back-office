import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import {
	isLdcOrDiscontinuanceOrEnforcementAppealType,
	isS78ExpeditedAppealType
} from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapStatementOfCommonGroundDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission,
	appellantCase
}) => {
	const id = 'statement-of-common-ground-due-date';

	if (
		!appealDetails.startedAt ||
		appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.WRITTEN ||
		isS78ExpeditedAppealType(
			appealDetails.appealType,
			appellantCase?.applicationDate,
			appellantCase?.applicationDecision,
			appellantCase?.typeOfPlanningApplication
		) ||
		(appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.HEARING &&
			isLdcOrDiscontinuanceOrEnforcementAppealType(appealDetails.appealType))
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
