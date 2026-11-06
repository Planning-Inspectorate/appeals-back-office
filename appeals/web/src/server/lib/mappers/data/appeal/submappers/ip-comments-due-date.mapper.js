import { isStatePassed } from '#lib/appeal-status.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { PROCEDURE_TYPE_NAME } from '@pins/appeals/constants/common.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { mapDueDateSummaryListItem } from './utils/due-date-mapper-helper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapIpCommentsDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'ip-comments-due-date';

	const isGeneric = isGenericAppealType(appealDetails.appealType);

	if (
		!appealDetails.startedAt ||
		(!isGeneric &&
			(appealDetails.procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 ||
				appealDetails.procedureType === PROCEDURE_TYPE_NAME.WRITTEN_PART_1))
	) {
		return { id, display: {} };
	}

	const editable =
		!isChildAppeal(appealDetails) &&
		userHasUpdateCasePermission &&
		Boolean(appealDetails.startedAt) &&
		(isGeneric
			? appealDetails.appealStatus !== APPEAL_CASE_STATUS.COMPLETE
			: !isStatePassed(appealDetails, APPEAL_CASE_STATUS.STATEMENTS));

	return mapDueDateSummaryListItem({
		id,
		text: 'Interested party comments due',
		dueDate: appealDetails.appealTimetable?.ipCommentsDueDate,
		appealDetails,
		currentRoute,
		editable,
		classes: 'appeal-ip-comments-due-date'
	});
};
