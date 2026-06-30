import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
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
export function changeAffectedListedBuilding(
	apiClient,
	appealId,
	listedBuildingId,
	affectedListedBuilding
) {
	const ids = assertValidNumericIds({ appealId, listedBuildingId });
	return apiClient.patch(`appeals/${ids.appealId}/listed-buildings/${ids.listedBuildingId}`, {
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
export function getAffectedListedBuilding(apiClient, listedBuildingId) {
	const ids = assertValidNumericIds({ listedBuildingId });
	return apiClient.get(`appeals/listed-buildings/${ids.listedBuildingId}`);
}
