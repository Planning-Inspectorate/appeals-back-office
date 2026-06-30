import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

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

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			article4AffectedDevelopmentRights: article4AffectedDevelopmentRights
		}
	});
}
