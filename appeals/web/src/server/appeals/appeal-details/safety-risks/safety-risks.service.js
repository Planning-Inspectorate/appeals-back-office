import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

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

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
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

	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			siteSafetyDetails
		}
	});
}
