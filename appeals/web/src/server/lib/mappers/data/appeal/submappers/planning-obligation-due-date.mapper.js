import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { displayPlanningObligation } from '@pins/appeals/utils/business-rules.js';
import { mapDueDateSummaryListItem } from './utils/due-date-mapper-helper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapPlanningObligationDueDate = ({
	appealDetails,
	appellantCase,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'planning-obligation-due-date';

	const isGeneric = isGenericAppealType(appealDetails.appealType);

	if (
		!appealDetails.startedAt ||
		(!isGeneric &&
			!displayPlanningObligation(
				appealDetails.appealType ?? undefined,
				appealDetails.procedureType ?? undefined,
				appellantCase?.planningObligation?.hasObligation ?? undefined
			))
	) {
		return { id, display: {} };
	}

	return mapDueDateSummaryListItem({
		id,
		text: 'Planning obligation due',
		dueDate: appealDetails.appealTimetable?.planningObligationDueDate,
		appealDetails,
		currentRoute,
		userHasUpdateCasePermission,
		classes: 'appeal-planning-obligation-due-date'
	});
};
