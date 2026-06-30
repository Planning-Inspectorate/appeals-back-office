import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealReference
 * @returns {Promise<import('@pins/appeals.api').Appeals.LinkableAppealSummary>}
 */
export function getLinkableAppealSummaryFromReference(apiClient, appealReference) {
	const ids = assertValidNumericIds({ appealReference });
	return apiClient.get(`appeals/linkable-appeal/${ids.appealReference}/related`).json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} otherAppealId
 * @returns {Promise<import('../appeal-details.types.js').WebAppeal>}
 */
export function postAssociateAppeal(apiClient, appealId, otherAppealId) {
	const ids = assertValidNumericIds({ appealId });
	return apiClient
		.post(`appeals/${ids.appealId}/associate-appeal`, {
			json: {
				linkedAppealId: otherAppealId
			}
		})
		.json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} otherAppealReference
 * @returns {Promise<import('../appeal-details.types.js').WebAppeal>}
 */
export function postAssociateLegacyAppeal(apiClient, appealId, otherAppealReference) {
	const ids = assertValidNumericIds({ appealId });
	return apiClient
		.post(`appeals/${ids.appealId}/associate-legacy-appeal`, {
			json: {
				linkedAppealReference: otherAppealReference
			}
		})
		.json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} relationshipId
 * @returns {Promise<{}>}
 */
export function postUnrelateRequest(apiClient, appealId, relationshipId) {
	const ids = assertValidNumericIds({ appealId });
	return apiClient
		.delete(`appeals/${ids.appealId}/unlink-appeal`, {
			json: { relationshipId }
		})
		.json();
}
