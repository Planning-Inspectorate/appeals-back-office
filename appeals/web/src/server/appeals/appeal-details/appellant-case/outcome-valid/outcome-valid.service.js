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

/**
 * Generate Notify preview templates for appellant and LPA
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} appellantCaseId
 * @param {boolean} [groundABarred]
 * @param {string} [otherInformation]
 * @returns {Promise<{appellant?: string, lpa?: string}>}
 */
export async function getEnforcementOutcomeValidNotifyPreviews(
	apiClient,
	appealId,
	appellantCaseId,
	groundABarred,
	otherInformation
) {
	const result = await apiClient
		.post(
			`appeals/${appealId}/appellant-cases/${appellantCaseId}/enforcement-valid-notify-preview`,
			{
				json: {
					groundABarred,
					otherInformation
				}
			}
		)
		.json();

	if (result.error) {
		throw new Error(result.error);
	}

	return result;
}
