import featureFlags from '#common/feature-flags.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import isLinkedAppeal from '#lib/mappers/utils/is-linked-appeal.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';

/**
 * @param {string | null | undefined} appealType
 * @returns {boolean}
 */
const canEditEnforcementNoticeProcedure = (appealType) => {
	if (appealType !== APPEAL_TYPE.ENFORCEMENT_NOTICE) {
		return true;
	}

	return (
		featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_HEARING) ||
		featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_INQUIRY)
	);
};

/** @type {import('../mapper.js').SubMapper} */
export const mapCaseProcedure = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	if (!appealDetails.appealTimetable) {
		return { id: 'case-procedure', display: {} };
	}

	return textSummaryListItem({
		id: 'case-procedure',
		text: 'Appeal procedure',
		value: appealDetails.procedureType || 'No data',
		link: `${currentRoute}/change-appeal-procedure-type/change-selected-procedure-type`,
		editable:
			userHasUpdateCasePermission &&
			!isLinkedAppeal(appealDetails) &&
			canEditEnforcementNoticeProcedure(appealDetails.appealType),
		classes: 'appeal-case-procedure'
	});
};
