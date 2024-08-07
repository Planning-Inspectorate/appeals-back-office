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
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			lpaNotificationMethods: updatedNotificationMethods
		}
	});
}
