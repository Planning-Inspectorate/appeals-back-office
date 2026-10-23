import { PROCEDURE_TYPE_NAME } from '@pins/appeals/constants/common.js';
import {
	isGenericAppealType,
	isLdcOrDiscontinuanceOrEnforcementAppealType
} from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { mapDueDateSummaryListItem } from './utils/due-date-mapper-helper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapStatementOfCommonGroundDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'statement-of-common-ground-due-date';

	const isGeneric = isGenericAppealType(appealDetails.appealType);

	if (
		!appealDetails.startedAt ||
		(!isGeneric &&
			(appealDetails.procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 ||
				appealDetails.procedureType === PROCEDURE_TYPE_NAME.WRITTEN_PART_1 ||
				appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.WRITTEN ||
				(appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.HEARING &&
					isLdcOrDiscontinuanceOrEnforcementAppealType(appealDetails.appealType))))
	) {
		return { id, display: {} };
	}

	return mapDueDateSummaryListItem({
		id,
		text: 'Statement of common ground due',
		dueDate: appealDetails.appealTimetable?.statementOfCommonGroundDueDate,
		appealDetails,
		currentRoute,
		userHasUpdateCasePermission,
		classes: 'appeal-statement-of-common-ground-due-date'
	});
};
