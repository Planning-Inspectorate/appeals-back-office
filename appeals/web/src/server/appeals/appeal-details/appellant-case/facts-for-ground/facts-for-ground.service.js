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
	return apiClient.patch(`appeals/${appealId}/grounds-for-appeal/${groundRef}`, {
		json: {
			factsForGround
		}
	});
}
