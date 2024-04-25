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
	/** @type {{[x: string]: string | boolean}} */
	const formattedData = {
		doesSiteHaveHealthAndSafetyIssues: convertFromYesNoToBoolean(updatedHeathAndSafetyRisks.radio)
	};
	if (convertFromYesNoToBoolean(updatedHeathAndSafetyRisks.radio)) {
		formattedData.healthAndSafetyDetails = updatedHeathAndSafetyRisks.details;
	}
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			...formattedData
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
	/** @type {{[x: string]: string | boolean}} */
	const formattedData = {
		hasHealthAndSafetyIssues: convertFromYesNoToBoolean(updatedHeathAndSafetyRisks.radio)
	};
	if (convertFromYesNoToBoolean(updatedHeathAndSafetyRisks.radio)) {
		formattedData.healthAndSafetyIssues = updatedHeathAndSafetyRisks.details;
	}
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			...formattedData
		}
	});
}
