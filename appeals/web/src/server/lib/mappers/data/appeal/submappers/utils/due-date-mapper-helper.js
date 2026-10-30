import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/**
 * @param {object} params
 * @param {string} params.id
 * @param {string} params.text
 * @param {string | null | undefined} [params.dueDate]
 * @param {any} params.appealDetails
 * @param {string} params.currentRoute
 * @param {boolean} [params.userHasUpdateCasePermission]
 * @param {boolean} [params.editable]
 * @param {string} params.classes
 */
export const mapDueDateSummaryListItem = ({
	id,
	text,
	dueDate,
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission,
	editable,
	classes
}) => {
	const isGeneric = isGenericAppealType(appealDetails.appealType);

	const isEditable =
		editable !== undefined
			? editable
			: !isChildAppeal(appealDetails) &&
				Boolean(userHasUpdateCasePermission) &&
				Boolean(appealDetails.startedAt) &&
				(isGeneric ? appealDetails.appealStatus !== APPEAL_CASE_STATUS.COMPLETE : true);

	return textSummaryListItem({
		id,
		text,
		value: dateISOStringToDisplayDate(dueDate, 'Not provided'),
		link: `${currentRoute}/timetable/edit`,
		editable: isEditable,
		actionText: isGeneric && !dueDate ? 'Add' : 'Change',
		classes
	});
};
