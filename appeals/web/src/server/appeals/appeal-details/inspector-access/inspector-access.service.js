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
	/** @type {{[x: string]: string | boolean}} */
	const formattedData = {
		doesSiteRequireInspectorAccess: convertFromYesNoToBoolean(updatedLpaInspectorAccess.radio)
	};
	if (convertFromYesNoToBoolean(updatedLpaInspectorAccess.radio)) {
		formattedData.inspectorAccessDetails = updatedLpaInspectorAccess.details;
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
 * @param {{radio: string, details: string}} updatedAppellantInspectorAccess
 * @returns {Promise<{}>}
 */
export function changeAppellantInspectorAccess(
	apiClient,
	appealId,
	appellantCaseId,
	updatedAppellantInspectorAccess
) {
	/** @type {{[x: string]: string | boolean}} */
	const formattedData = {
		doesSiteRequireInspectorAccess: convertFromYesNoToBoolean(updatedAppellantInspectorAccess.radio)
	};
	if (convertFromYesNoToBoolean(updatedAppellantInspectorAccess.radio)) {
		formattedData.inspectorAccessDetails = updatedAppellantInspectorAccess.details;
	}
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			...formattedData
		}
	});
}
