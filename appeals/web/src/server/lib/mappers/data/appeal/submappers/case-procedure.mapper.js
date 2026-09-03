import featureFlags from '#common/feature-flags.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import isLinkedAppeal from '#lib/mappers/utils/is-linked-appeal.js';
import { appealProcedureNameToLabelText } from '#lib/procedure-type-display-name-formatter.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { isS78ExpeditedAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { canChangeS78ExpeditedAppealProcedure } from '@pins/appeals/utils/business-rules.js';

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {boolean} [isS78Expedited]
 * @returns {boolean}
 */
const canEditProcedure = (appealDetails, isS78Expedited = false) => {
	if (isS78Expedited) {
		return canChangeS78ExpeditedAppealProcedure({
			appealType: appealDetails.appealType,
			procedureType: appealDetails.procedureType,
			currentStage: appealDetails.appealStatus,
			isExpeditedCopFeatureActive: featureFlags.isFeatureActive(
				FEATURE_FLAG_NAMES.EXPEDITED_APPEALS_CHANGE_PROCEDURE
			)
		});
	}

	if (appealDetails.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE) {
		return (
			featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_HEARING) ||
			featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_INQUIRY)
		);
	}

	return true;
};

/** @type {import('../mapper.js').SubMapper} */
export const mapCaseProcedure = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission,
	appellantCase
}) => {
	if (!appealDetails.appealTimetable) {
		return { id: 'case-procedure', display: {} };
	}
	const isS78Expedited = isS78ExpeditedAppealType(
		appealDetails.appealType,
		appellantCase?.applicationDate,
		appellantCase?.applicationDecision,
		appellantCase?.typeOfPlanningApplication
	);
	return textSummaryListItem({
		id: 'case-procedure',
		text: 'Appeal procedure',
		value:
			appealProcedureNameToLabelText(appealDetails.procedureType || '', isS78Expedited) ||
			'No data',
		link: `${currentRoute}/change-appeal-procedure-type/change-selected-procedure-type`,
		editable:
			userHasUpdateCasePermission &&
			!isLinkedAppeal(appealDetails) &&
			canEditProcedure(appealDetails, isS78Expedited),
		classes: 'appeal-case-procedure'
	});
};
