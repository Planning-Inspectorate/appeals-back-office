import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} LpaQuestionnaire
 */

/**
 * @param {string|number} appealId
 * @param {string} [lpaQuestionnaireId]
 * @param {import('got').Got} apiClient
 * @returns {Promise<LpaQuestionnaire>}
 */
export function getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId = undefined) {
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId: lpaQuestionnaireId ?? 0 });

	if (lpaQuestionnaireId !== undefined) {
		return apiClient
			.get(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`)
			.json();
	}

	return apiClient.get(`appeals/${ids.appealId}/lpa-questionnaire`).json();
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
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient
		.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
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
