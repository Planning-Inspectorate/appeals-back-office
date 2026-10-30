import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { mapDueDateSummaryListItem } from './utils/due-date-mapper-helper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCaseManagementConferenceDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'case-management-conference-due-date';

	const isGeneric = isGenericAppealType(appealDetails.appealType);

	if (
		!appealDetails.startedAt ||
		(!isGeneric && appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY)
	) {
		return { id, display: {} };
	}

	return mapDueDateSummaryListItem({
		id,
		text: 'Case management conference due',
		dueDate: appealDetails.appealTimetable?.caseManagementConferenceDueDate,
		appealDetails,
		currentRoute,
		userHasUpdateCasePermission,
		classes: 'appeal-case-management-conference-due-date'
	});
};
