/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealHASCase} AppealHASCase */

import formatValidationOutcomeResponse from '#utils/format-validation-outcome-response.js';

/**
 * @param {MappingRequest} data
 * @returns {AppealHASCase}
 */
export const mapCaseValidation = (data) => {
	const { appeal } = data;
	const validation = formatValidationOutcomeResponse(
		appeal.appellantCase?.appellantCaseValidationOutcome?.name || '',
		appeal.appellantCase?.appellantCaseIncompleteReasonsSelected,
		appeal.appellantCase?.appellantCaseInvalidReasonsSelected
	);

	const incompleteDetails = [];
	const invalidDetails = [];

	if (validation?.incompleteReasons?.length) {
		for (const incompleteReason of validation.incompleteReasons) {
			if (incompleteReason.text?.length) {
				incompleteReason.text.map((text) =>
					incompleteDetails.push(`${incompleteReason.name?.name}: ${text}`)
				);
			} else {
				incompleteDetails.push(incompleteReason.name?.name);
			}
		}
	}
	if (validation?.invalidReasons?.length) {
		for (const invalidReason of validation.invalidReasons) {
			if (invalidReason.text?.length) {
				invalidReason.text.map((text) =>
					invalidDetails.push(`${invalidReason.name?.name}: ${text}`)
				);
			} else {
				invalidDetails.push(invalidReason.name?.name);
			}
		}
	}

	return {
		// @ts-ignore
		caseValidationOutcome: validation?.outcome?.toLowerCase() || null,
		// @ts-ignore
		caseValidationInvalidDetails: invalidDetails.length > 0 ? invalidDetails : null,
		// @ts-ignore
		caseValidationIncompleteDetails: incompleteDetails.length > 0 ? incompleteDetails : null
	};
};
