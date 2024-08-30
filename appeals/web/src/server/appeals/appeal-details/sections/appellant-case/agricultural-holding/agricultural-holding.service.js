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
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
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
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
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
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			otherTenantsAgriculturalHolding: updatedValue
		}
	});
}
