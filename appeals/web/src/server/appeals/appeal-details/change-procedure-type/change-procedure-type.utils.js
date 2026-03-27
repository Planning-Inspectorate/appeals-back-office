import { getEnabledAppealTypes } from '#common/feature-flags-appeal-types.js';
import featureFlags from '#common/feature-flags.js';
import { getEnabledHearingAppealTypes } from '#common/hearing-appeal-types.js';
import { getEnabledInquiryAppealTypes } from '#common/inquiry-appeal-types.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @param {string|undefined|null} appealType
 * @returns {string[]}
 */
export const getAvailableProcedureTypesForAppealType = (appealType) => {
	if (!appealType) {
		return [];
	}

	/** @type {string[]} */
	const availableProcedureTypes = [];

	if (
		featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78) &&
		getEnabledAppealTypes().includes(appealType)
	) {
		availableProcedureTypes.push(APPEAL_CASE_PROCEDURE.WRITTEN);
	}

	if (getEnabledHearingAppealTypes().includes(appealType)) {
		availableProcedureTypes.push(APPEAL_CASE_PROCEDURE.HEARING);
	}

	if (getEnabledInquiryAppealTypes().includes(appealType)) {
		availableProcedureTypes.push(APPEAL_CASE_PROCEDURE.INQUIRY);
	}

	return availableProcedureTypes;
};
