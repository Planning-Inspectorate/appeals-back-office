import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

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

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			reasonForNeighbourVisits
		}
	});
}
