import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @returns {Promise<import('@pins/appeals.api').Api.AllLPANotificationMethodsResponse>}
 */
export function getLpaNotificationMethods(apiClient) {
	return apiClient.get('appeals/lpa-notification-methods').json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{key: string}} updatedNotificationMethods
 * @returns {Promise<{}>}
 */
export function changeNotificationMethods(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedNotificationMethods
) {
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			lpaNotificationMethods: updatedNotificationMethods
		}
	});
}
