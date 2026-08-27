import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{radio: string, details: string}} updatedLpaInspectorAccess
 * @returns {Promise<{}>}
 */
export function changeLpaInspectorAccess(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedLpaInspectorAccess
) {
	let siteAccessDetails;

	siteAccessDetails = updatedLpaInspectorAccess.details;

	if (!convertFromYesNoToBoolean(updatedLpaInspectorAccess.radio)) {
		siteAccessDetails = null;
	}

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			siteAccessDetails
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {{radio: string, details: string}} updatedAppellantInspectorAccess
 * @returns {Promise<{}>}
 */
export function changeAppellantInspectorAccess(
	apiClient,
	appealId,
	appellantCaseId,
	updatedAppellantInspectorAccess
) {
	let siteAccessDetails;
	siteAccessDetails = updatedAppellantInspectorAccess.details;

	if (!convertFromYesNoToBoolean(updatedAppellantInspectorAccess.radio)) {
		siteAccessDetails = null;
	}

	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			siteAccessDetails
		}
	});
}
