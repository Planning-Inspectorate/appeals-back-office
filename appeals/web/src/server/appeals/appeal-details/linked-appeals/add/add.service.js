import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealReference
 * @returns {Promise<import('@pins/appeals.api').Appeals.LinkableAppealSummary>}
 */
export async function getLinkableAppealByReference(apiClient, appealReference) {
	const ids = assertValidNumericIds({ appealReference });
	return apiClient.get(`appeals/linkable-appeal/${ids.appealReference}/linked`).json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} linkedAppealId
 * @param {boolean} [targetAppealIsParent]
 * @returns {Promise<{}>}
 */
export async function linkAppealToBackOfficeAppeal(
	apiClient,
	appealId,
	linkedAppealId,
	targetAppealIsParent = false
) {
	const ids = assertValidNumericIds({ appealId });
	return apiClient
		.post(`appeals/${ids.appealId}/link-appeal`, {
			json: {
				linkedAppealId,
				isCurrentAppealParent: !targetAppealIsParent
			}
		})
		.json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} linkedAppealReference
 * @param {boolean} [targetAppealIsParent]
 * @returns {Promise<{}>}
 */
export async function linkAppealToLegacyAppeal(
	apiClient,
	appealId,
	linkedAppealReference,
	targetAppealIsParent = false
) {
	const ids = assertValidNumericIds({ appealId });
	return apiClient
		.post(`appeals/${ids.appealId}/link-legacy-appeal`, {
			json: {
				linkedAppealReference,
				isCurrentAppealParent: targetAppealIsParent
			}
		})
		.json();
}
