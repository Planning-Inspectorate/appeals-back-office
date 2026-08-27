import {
	assertValidGroundRef,
	assertValidNumericIds
} from '#lib/validators/api-parameters.validator.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} groundRef
 * @param {string} factsForGround
 * @returns {Promise<{}>}
 */
export function changeFactsForGround(
	apiClient,
	appealId,
	appellantCaseId,
	groundRef,
	factsForGround
) {
	const ids = assertValidNumericIds({ appealId });
	const refs = assertValidGroundRef({ groundRef });
	return apiClient.patch(`appeals/${ids.appealId}/grounds-for-appeal/${refs.groundRef}`, {
		json: {
			factsForGround
		}
	});
}
