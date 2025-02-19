import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedData
 * @returns {Promise<{}>}
 */
export function changeEiaColumnTwoThreshold(apiClient, appealId, lpaQuestionnaireId, updatedData) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
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
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
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

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
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

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			consultedBodiesDetails
		}
	});
}
