/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string|null} updatedData
 * @returns {Promise<{}>}
 */
export function changeEiaEnvironmentalImpactSchedule(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedData
) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			eiaEnvironmentalImpactSchedule: updatedData
		}
	});
}
