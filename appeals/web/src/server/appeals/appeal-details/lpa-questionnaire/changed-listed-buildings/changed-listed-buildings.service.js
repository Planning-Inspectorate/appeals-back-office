import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
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
	const ids = assertValidNumericIds({ appealId });
	return apiClient.post(`appeals/${ids.appealId}/listed-buildings`, {
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
	const ids = assertValidNumericIds({ appealId, listedBuildingId });
	return apiClient.patch(`appeals/${ids.appealId}/listed-buildings/${ids.listedBuildingId}`, {
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
	const ids = assertValidNumericIds({ appealId });
	return apiClient.delete(`appeals/${ids.appealId}/listed-buildings`, {
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
	const ids = assertValidNumericIds({ listedBuildingId });
	return apiClient.get(`appeals/listed-buildings/${ids.listedBuildingId}`);
}
