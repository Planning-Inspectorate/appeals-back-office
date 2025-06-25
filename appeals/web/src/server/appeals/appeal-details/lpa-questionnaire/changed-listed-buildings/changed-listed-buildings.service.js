/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} affectedListedBuilding
 * @returns {Promise<{}>}
 */
export function addChangedListedBuilding(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	affectedListedBuilding
) {
	const formattedData = {
		lpaQuestionnaireId,
		listEntry: affectedListedBuilding,
		affectsListedBuilding: false
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
export function changeChangedListedBuilding(
	apiClient,
	appealId,
	listedBuildingId,
	affectedListedBuilding
) {
	return apiClient.patch(`appeals/${appealId}/listed-buildings/${listedBuildingId}`, {
		json: {
			listEntry: affectedListedBuilding,
			affectsListedBuilding: false
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
export function removeChangedListedBuilding(apiClient, appealId, listedBuildingId) {
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
export function getChangedListedBuilding(apiClient, listedBuildingId) {
	return apiClient.get(`appeals/listed-buildings/${listedBuildingId}`);
}
