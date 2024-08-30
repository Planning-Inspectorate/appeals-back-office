import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

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

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
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

	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			siteAccessDetails
		}
	});
}
