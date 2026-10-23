import { isStatePassed } from '#lib/appeal-status.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { APPEAL_TYPE, PROCEDURE_TYPE_NAME } from '@pins/appeals/constants/common.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { mapDueDateSummaryListItem } from './utils/due-date-mapper-helper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaStatementDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'lpa-statement-due-date';

	const isGeneric = isGenericAppealType(appealDetails.appealType);

	if (
		!appealDetails.startedAt ||
		(!isGeneric &&
			(appealDetails.procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 ||
				appealDetails.procedureType === PROCEDURE_TYPE_NAME.WRITTEN_PART_1))
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

	const editable =
		!isChildAppeal(appealDetails) &&
		userHasUpdateCasePermission &&
		(isGeneric
			? appealDetails.appealStatus !== APPEAL_CASE_STATUS.COMPLETE
			: !isStatePassed(appealDetails, APPEAL_CASE_STATUS.STATEMENTS));

	return mapDueDateSummaryListItem({
		id,
		text,
		dueDate: appealDetails.appealTimetable?.lpaStatementDueDate,
		appealDetails,
		currentRoute,
		editable,
		classes: 'appeal-lpa-statement-due-date'
	});
};
