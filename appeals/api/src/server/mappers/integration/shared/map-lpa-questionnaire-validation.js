/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.NeighbouringSite} NeighbouringSite */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealHASCase} AppealHASCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import formatValidationOutcomeResponse from '#utils/format-validation-outcome-response.js';

/**
 * @param {MappingRequest} data
 * @returns {AppealHASCase}
 */
export const mapQuestionnaireValidation = (data) => {
	const { appeal } = data;
	const validation = formatValidationOutcomeResponse(
		appeal.lpaQuestionnaire?.lpaQuestionnaireValidationOutcome?.name || '',
		appeal.lpaQuestionnaire?.lpaQuestionnaireIncompleteReasonsSelected
	);

	const incompleteDetails = [];

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

	return {
		// @ts-ignore
		lpaQuestionnaireValidationOutcome: validation?.outcome?.toLowerCase() || null,
		// @ts-ignore
		lpaQuestionnaireValidationDetails: incompleteDetails.length > 0 ? incompleteDetails : null
	};
};
