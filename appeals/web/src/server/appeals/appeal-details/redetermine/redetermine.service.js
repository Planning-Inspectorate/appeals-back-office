import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 * @param {import('got').Got} apiClient
 * @param {number|string} appealId
 * @returns {Promise<any>}
 */
export async function postRedetermineAppeal(apiClient, appealId) {
	const ids = assertValidNumericIds({ appealId });
	return await apiClient.post(`appeals/${ids.appealId}/redetermine`).json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {number|string} appealId
 * @returns {Promise<any>}
 */
export async function postProgressRedetermination(apiClient, appealId) {
	const ids = assertValidNumericIds({ appealId });
	return await apiClient.post(`appeals/${ids.appealId}/redetermine/progress`).json();
}
