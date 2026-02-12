/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} appealUnderActSection
 * @returns {Promise<{}>}
 */
export function changeAppealUnderActSection(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	appealUnderActSection
) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			appealUnderActSection: appealUnderActSection
		}
	});
}
