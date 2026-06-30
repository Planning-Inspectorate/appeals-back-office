import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
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

	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			...formattedData
		}
	});
}
