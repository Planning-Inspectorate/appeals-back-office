/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} groundRef
 * @param {string} factsForGround
 * @returns {Promise<{}>}
 */
export function ChangeFactsForGround(
	apiClient,
	appealId,
	appellantCaseId,
	groundRef,
	factsForGround
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			appealGround: {
				groundRef,
				factsForGround
			}
		}
	});
}
