import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedGreenBelt
 * @returns {Promise<{}>}
 */
export function changeGreenBeltAppellant(apiClient, appealId, appellantCaseId, updatedGreenBelt) {
	const formattedGreenBelt = convertFromYesNoToBoolean(updatedGreenBelt);

	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			isGreenBelt: formattedGreenBelt
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedGreenBelt
 * @returns {Promise<{}>}
 */
export function changeGreenBeltLPA(apiClient, appealId, lpaQuestionnaireId, updatedGreenBelt) {
	const formattedGreenBelt = convertFromYesNoToBoolean(updatedGreenBelt);

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			isGreenBelt: formattedGreenBelt
		}
	});
}
