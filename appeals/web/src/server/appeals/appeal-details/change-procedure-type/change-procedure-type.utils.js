import { getEnabledAppealTypes } from '#common/feature-flags-appeal-types.js';
import featureFlags from '#common/feature-flags.js';
import { getEnabledHearingAppealTypes } from '#common/hearing-appeal-types.js';
import { getEnabledInquiryAppealTypes } from '#common/inquiry-appeal-types.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { isS78ExpeditedAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { canChangeS78ExpeditedToTargetProcedure } from '@pins/appeals/utils/business-rules.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @typedef {Object} AvailableProcedureTypesOptions
 * @property {string|undefined|null} [appealType]
 * @property {string|undefined|null} [procedureType]
 * @property {{ applicationDate?: string|Date|null, applicationDecision?: string|null, typeOfPlanningApplication?: string|null }|any} [appellantCase]
 * @property {string} [currentStage]
 * @property {boolean} [isS78Expedited]
 */

/**
 * Returns available procedure types based on appeal parameters.
 * @param {AvailableProcedureTypesOptions} [options]
 * @returns {string[]}
 */
export const getAvailableProcedureTypes = ({
	appealType,
	procedureType,
	appellantCase,
	currentStage,
	isS78Expedited = false
} = {}) => {
	if (!appealType) {
		return [];
	}

	const resolvedIsS78Expedited =
		isS78Expedited ||
		isS78ExpeditedAppealType(
			appealType,
			appellantCase?.applicationDate,
			appellantCase?.applicationDecision,
			appellantCase?.typeOfPlanningApplication
		);

	const isExpeditedCopFeatureActive = featureFlags.isFeatureActive(
		FEATURE_FLAG_NAMES.EXPEDITED_APPEALS_CHANGE_PROCEDURE
	);

	/** @type {string[]} */
	const availableProcedureTypes = [];

	if (
		resolvedIsS78Expedited
			? canChangeS78ExpeditedToTargetProcedure({
					targetProcedure: APPEAL_CASE_PROCEDURE.WRITTEN,
					appealType,
					currentProcedureType: procedureType ?? undefined,
					currentStage,
					isExpeditedCopFeatureActive
				})
			: getEnabledAppealTypes().includes(appealType)
	) {
		availableProcedureTypes.push(APPEAL_CASE_PROCEDURE.WRITTEN);
	}

	if (
		resolvedIsS78Expedited
			? canChangeS78ExpeditedToTargetProcedure({
					targetProcedure: APPEAL_CASE_PROCEDURE.HEARING,
					appealType,
					currentProcedureType: procedureType ?? undefined,
					currentStage,
					isExpeditedCopFeatureActive
				})
			: getEnabledHearingAppealTypes().includes(appealType)
	) {
		availableProcedureTypes.push(APPEAL_CASE_PROCEDURE.HEARING);
	}

	if (
		resolvedIsS78Expedited
			? canChangeS78ExpeditedToTargetProcedure({
					targetProcedure: APPEAL_CASE_PROCEDURE.INQUIRY,
					appealType,
					currentProcedureType: procedureType ?? undefined,
					currentStage,
					isExpeditedCopFeatureActive
				})
			: getEnabledInquiryAppealTypes().includes(appealType)
	) {
		availableProcedureTypes.push(APPEAL_CASE_PROCEDURE.INQUIRY);
	}

	return availableProcedureTypes;
};

/**
 * Helper to get available procedure types directly from an appeal object.
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal & { appellantCase?: any }} [appeal]
 * @returns {string[]}
 */
export const getAvailableProcedureTypesForAppeal = (appeal) => {
	if (!appeal) {
		return [];
	}

	return getAvailableProcedureTypes({
		appealType: appeal.appealType,
		procedureType: appeal.procedureType,
		appellantCase: appeal.appellantCase,
		currentStage: appeal.appealStatus
	});
};

/**
 * Alias for backwards compatibility.
 * @param {string|(import('#appeals/appeal-details/appeal-details.types.js').WebAppeal & { appellantCase?: any })|undefined|null} [appealOrAppealType]
 * @returns {string[]}
 */
export const getAvailableProcedureTypesForAppealType = (appealOrAppealType) => {
	if (!appealOrAppealType) {
		return [];
	}

	if (typeof appealOrAppealType === 'object') {
		return getAvailableProcedureTypesForAppeal(appealOrAppealType);
	}

	return getAvailableProcedureTypes({ appealType: appealOrAppealType });
};
