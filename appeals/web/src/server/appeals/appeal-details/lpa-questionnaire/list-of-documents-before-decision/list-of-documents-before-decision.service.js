import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
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
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			listOfDocumentsBeforeDecision: updatedValue
		}
	});
}
