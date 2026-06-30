import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
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
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			appealUnderActSection: appealUnderActSection
		}
	});
}
