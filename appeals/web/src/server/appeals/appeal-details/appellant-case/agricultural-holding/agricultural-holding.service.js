import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {boolean} updatedValue
 * @returns {Promise<{}>}
 */
export function changePartOfAgriculturalHolding(
	apiClient,
	appealId,
	appellantCaseId,
	updatedValue
) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			agriculturalHolding: updatedValue
		}
	});
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {boolean} updatedValue
 * @returns {Promise<{}>}
 */
export function changeTenantOfAgriculturalHolding(
	apiClient,
	appealId,
	appellantCaseId,
	updatedValue
) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			tenantAgriculturalHolding: updatedValue
		}
	});
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {boolean} updatedValue
 * @returns {Promise<{}>}
 */
export function changeOtherTenantsOfAgriculturalHolding(
	apiClient,
	appealId,
	appellantCaseId,
	updatedValue
) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			otherTenantsAgriculturalHolding: updatedValue
		}
	});
}
