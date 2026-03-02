import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{radio: string, details: string|null}} updatedData
 * @returns {Promise<{}>}
 */
export function changeIsAppealInvalid(apiClient, appealId, lpaQuestionnaireId, updatedData) {
	/** @type {string|null} */
	const lpaConsiderAppealInvalid = updatedData.radio;
	/** @type {string|null} */
	let lpaAppealInvalidReasons = updatedData.details;

	if (!convertFromYesNoToBoolean(lpaConsiderAppealInvalid)) {
		lpaAppealInvalidReasons = null;
	}

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			lpaConsiderAppealInvalid: convertFromYesNoToBoolean(lpaConsiderAppealInvalid),
			lpaAppealInvalidReasons
		}
	});
}
