import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/** @typedef {import('@pins/appeals.api').Schema.Ground} Ground */

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string[]|null} groundsForAppeal
 * @returns {Promise<{}>}
 */
export function changeGroundsForAppeal(apiClient, appealId, appellantCaseId, groundsForAppeal) {
	const ids = assertValidNumericIds({ appealId });
	return apiClient.patch(`appeals/${ids.appealId}/grounds-for-appeal`, {
		json: {
			groundsForAppeal
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @returns {Promise<Ground[]>}
 */
export function getAllGrounds(apiClient) {
	return apiClient.get(`appeals/grounds`).json();
}
