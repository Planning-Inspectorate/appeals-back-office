import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{radio: string, details: string}} updatedPdRightsRemoved
 * @returns {Promise<{}>}
 */
export function changePdRightsRemoved(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedPdRightsRemoved
) {
	let article4AffectedDevelopmentRights;
	article4AffectedDevelopmentRights = updatedPdRightsRemoved.details;

	if (!convertFromYesNoToBoolean(updatedPdRightsRemoved.radio)) {
		article4AffectedDevelopmentRights = null;
	}

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			article4AffectedDevelopmentRights: article4AffectedDevelopmentRights
		}
	});
}
