import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{radio: string, details: string}} updatedNeighbouringSiteAccessDetails
 * @returns {Promise<{}>}
 */
export function changeNeighbouringSiteAccess(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedNeighbouringSiteAccessDetails
) {
	/** @type {string|null} */
	let reasonForNeighbourVisits = updatedNeighbouringSiteAccessDetails.details;

	if (!convertFromYesNoToBoolean(updatedNeighbouringSiteAccessDetails.radio)) {
		reasonForNeighbourVisits = null;
	}

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			reasonForNeighbourVisits
		}
	});
}
