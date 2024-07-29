import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {{ radio: string }} updatedLPAChangedDescription
 * @returns {Promise<{}>}
 */
export function changeLPAChangedDescription(
	apiClient,
	appealId,
	appellantCaseId,
	updatedLPAChangedDescription
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			developmentDescription: {
				isCorrect: convertFromYesNoToBoolean(updatedLPAChangedDescription.radio)
			}
		}
	});
}
