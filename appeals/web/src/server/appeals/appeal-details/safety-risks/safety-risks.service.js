import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{radio: string, details: string}} updatedHeathAndSafetyRisks
 * @returns {Promise<{}>}
 */
export function changeLpaSafetyRisks(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedHeathAndSafetyRisks
) {
	let siteSafetyDetails;
	siteSafetyDetails = updatedHeathAndSafetyRisks.details;

	if (!convertFromYesNoToBoolean(updatedHeathAndSafetyRisks.radio)) {
		siteSafetyDetails = null;
	}

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			siteSafetyDetails
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {{radio: string, details: string}} updatedHeathAndSafetyRisks
 * @returns {Promise<{}>}
 */
export function changeAppellantSafetyRisks(
	apiClient,
	appealId,
	appellantCaseId,
	updatedHeathAndSafetyRisks
) {
	let siteSafetyDetails;
	siteSafetyDetails = updatedHeathAndSafetyRisks.details;

	if (!convertFromYesNoToBoolean(updatedHeathAndSafetyRisks.radio)) {
		siteSafetyDetails = null;
	}

	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			siteSafetyDetails
		}
	});
}
