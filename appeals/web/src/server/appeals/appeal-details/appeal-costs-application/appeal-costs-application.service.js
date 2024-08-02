import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedAppellantCostsApplication
 * @returns {Promise<{}>}
 */
export function changeAppealCostsApplication(
	apiClient,
	appealId,
	appellantCaseId,
	updatedAppellantCostsApplication
) {
	const formattedAppellantCostsApplication = convertFromYesNoToBoolean(
		updatedAppellantCostsApplication
	);

	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			appellantCostsAppliedFor: formattedAppellantCostsApplication
		}
	});
}
