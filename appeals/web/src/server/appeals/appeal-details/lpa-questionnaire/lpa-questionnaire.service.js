/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} LpaQuestionnaire
 */

/**
 * @param {string|number} appealId
 * @param {string} lpaQuestionnaireId
 * @param {import('got').Got} apiClient
 * @returns {Promise<LpaQuestionnaire>}
 */
export function getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId) {
	return apiClient.get(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`).json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {import('./lpa-questionnaire.types.js').LPAQuestionnaireValidationOutcomeRequest} reviewOutcome
 * @returns {Promise<LpaQuestionnaire>}
 */
export function setReviewOutcomeForLpaQuestionnaire(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	reviewOutcome
) {
	return apiClient
		.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
			json: { ...reviewOutcome }
		})
		.json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @returns {Promise<import('@pins/appeals.api').Appeals.ReasonOption[]>}
 */
export async function getLPAQuestionnaireIncompleteReasonOptions(apiClient) {
	return apiClient.get(`appeals/lpa-questionnaire-incomplete-reasons`).json();
}
