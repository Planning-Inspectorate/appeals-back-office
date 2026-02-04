/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {{radio: string, details: string}} updatedSiteOwnership
 * @returns {Promise<{}>}
 */
export function changeSiteOwnership(apiClient, appealId, appellantCaseId, updatedSiteOwnership) {
	const formattedData =
		updatedSiteOwnership.radio === 'fully'
			? { ownsAllLand: true, ownsSomeLand: false }
			: updatedSiteOwnership.radio === 'partially'
				? { ownsAllLand: false, ownsSomeLand: true }
				: { ownsAllLand: false, ownsSomeLand: false };

	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			...formattedData
		}
	});
}
