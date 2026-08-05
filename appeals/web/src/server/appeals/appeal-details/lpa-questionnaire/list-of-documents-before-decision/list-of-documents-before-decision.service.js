/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedValue
 * @returns {Promise<{}>}
 */
export function changeListDocumentsBeforeDecision(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedValue
) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			listOfDocumentsBeforeDecision: updatedValue
		}
	});
}
