/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} affectedListedBuilding
 * @returns {Promise<{}>}
 */
export function addAffectedListedBuilding(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	affectedListedBuilding
) {
	const formattedData = {
		lpaQuestionnaireId,
		listEntry: affectedListedBuilding,
		affectsListedBuilding: true
	};
	return apiClient.post(`appeals/${appealId}/listed-buildings`, {
		json: {
			...formattedData
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} listedBuildingId
 * @param {string} affectedListedBuilding
 * @returns {Promise<{}>}
 */
export function changeAffectedListedBuilding(
	apiClient,
	appealId,
	listedBuildingId,
	affectedListedBuilding
) {
	return apiClient.patch(`appeals/${appealId}/listed-buildings/${listedBuildingId}`, {
		json: {
			listEntry: affectedListedBuilding,
			affectsListedBuilding: true
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} listedBuildingId
 * @returns {Promise<{}>}
 */
export function removeAffectedListedBuilding(apiClient, appealId, listedBuildingId) {
	return apiClient.delete(`appeals/${appealId}/listed-buildings`, {
		json: {
			listedBuildingId
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} listedBuildingId
 * @returns {Promise<{}>}
 */
export function getAffectedListedBuilding(apiClient, listedBuildingId) {
	return apiClient.get(`appeals/listed-buildings/${listedBuildingId}`);
}
