/**
 * @typedef {{decisionType: string, outcome: string|null, invalidReason?: string|null, documentGuid: string|null, documentDate: string|null}} Decision
 * @typedef {import('./issue-decision.types.js').InspectorDecisionRequest} InspectorDecisionRequest
 *
 */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {Decision[]} decisions
 * @returns {Promise<{}>}
 */
export async function postInspectorDecision(apiClient, appealId, decisions) {
	return await apiClient
		.post(`appeals/${appealId}/decision`, {
			json: { decisions }
		})
		.json();
}
