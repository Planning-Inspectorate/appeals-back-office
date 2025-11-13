/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealReference
 * @returns {Promise<import('@pins/appeals.api').Appeals.LinkableAppealSummary>}
 */
export function getRelatableAppealSummaryFromReference(apiClient, appealReference) {
	return apiClient.get(`appeals/relatable-appeal/${appealReference}`).json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} relationshipId
 * @returns {Promise<{}>}
 */
export function postUnrelateRequest(apiClient, appealId, relationshipId) {
	const appealIdNumber = parseInt(appealId, 10);
	return apiClient
		.delete(`appeals/${appealIdNumber}/unrelate-appeal`, {
			json: { relationshipId }
		})
		.json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} otherAppealId
 * @returns {Promise<import('../appeal-details.types.js').WebAppeal>}
 */
export function postAssociateAppeal(apiClient, appealId, otherAppealId) {
	return apiClient
		.post(`appeals/${appealId}/associate-appeal`, {
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
	return apiClient
		.post(`appeals/${appealId}/associate-legacy-appeal`, {
			json: {
				linkedAppealReference: otherAppealReference
			}
		})
		.json();
}
