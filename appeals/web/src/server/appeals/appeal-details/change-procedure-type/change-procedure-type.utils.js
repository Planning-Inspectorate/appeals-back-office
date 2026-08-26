import { getEnabledAppealTypes } from '#common/feature-flags-appeal-types.js';
import { getEnabledHearingAppealTypes } from '#common/hearing-appeal-types.js';
import { getEnabledInquiryAppealTypes } from '#common/inquiry-appeal-types.js';
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

	if (getEnabledAppealTypes().includes(appealType)) {
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
