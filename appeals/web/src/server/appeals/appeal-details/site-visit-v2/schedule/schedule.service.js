/** @typedef {import('#appeals/appeal-details/appeal-details.types').WebAppeal} Appeal */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} appellantCaseId
 * @param {string|null} validAt
 * @param {string} [outcome]
 * @param {boolean} [groundABarred]
 * @param {string} [otherInformation]
 * @returns {Promise<Appeal>}
 */
export async function setReviewOutcomeValidForAppellantCase(
	apiClient,
	appealId,
	appellantCaseId,
	validAt,
	outcome,
	groundABarred,
	otherInformation
) {
	return await apiClient
		.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
			json: {
				validationOutcome: 'valid',
				validAt: validAt,
				outcome,
				groundABarred,
				otherInformation
			}
		})
		.json();
}
