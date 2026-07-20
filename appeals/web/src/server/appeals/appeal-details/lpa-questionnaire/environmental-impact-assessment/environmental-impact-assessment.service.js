import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedData
 * @returns {Promise<{}>}
 */
export function changeEiaColumnTwoThreshold(apiClient, appealId, lpaQuestionnaireId, updatedData) {
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			eiaColumnTwoThreshold: convertFromYesNoToBoolean(updatedData)
		}
	});
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedData
 * @returns {Promise<{}>}
 */
export function changeEiaRequiresEnvironmentalStatement(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedData
) {
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			eiaRequiresEnvironmentalStatement: convertFromYesNoToBoolean(updatedData)
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{radio: string, details: string}} updatedSensitiveAreaDetails
 * @returns {Promise<{}>}
 */
export function changeEiaSensitiveAreaDetails(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedSensitiveAreaDetails
) {
	/** @type {string|null} */
	let eiaSensitiveAreaDetails = updatedSensitiveAreaDetails.details;

	if (!convertFromYesNoToBoolean(updatedSensitiveAreaDetails.radio)) {
		eiaSensitiveAreaDetails = null;
	}

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			eiaSensitiveAreaDetails
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{radio: string, details: string}} updatedConsultedBodiesDetails
 * @returns {Promise<{}>}
 */
export function changeEiaConsultedBodiesDetails(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedConsultedBodiesDetails
) {
	/** @type {string|null} */
	let consultedBodiesDetails = updatedConsultedBodiesDetails.details;

	if (!convertFromYesNoToBoolean(updatedConsultedBodiesDetails.radio)) {
		consultedBodiesDetails = null;
	}

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			consultedBodiesDetails
		}
	});
}
