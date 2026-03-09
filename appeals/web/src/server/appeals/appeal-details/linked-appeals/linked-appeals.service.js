import { LINK_APPEALS_UNLINK_OPERATION } from '@pins/appeals/constants/support.js';

/** @typedef {{firstName: string; lastName: string; organisationName: string | null | undefined; email: string | null | undefined; phoneNumber: string | null | undefined;}} WebServiceUser*/

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string | number} appealId
 * @param {string} [appealRefToReplaceLead]
 * @param {string} [appealEmailToReplaceLead]
 * @param {string} [operation]
 * @returns {Promise<{}>}
 */
export function postUpdateLinkedAppealsRequest(
	apiClient,
	appealId,
	appealRefToReplaceLead,
	appealEmailToReplaceLead,
	operation = LINK_APPEALS_UNLINK_OPERATION
) {
	const data = { operation };

	if (appealRefToReplaceLead) {
		// @ts-ignore
		data.appealRefToReplaceLead = appealRefToReplaceLead;
	}

	if (appealEmailToReplaceLead) {
		// @ts-ignore
		data.appealEmailToReplaceLead = appealEmailToReplaceLead;
	}

	return apiClient
		.post(`appeals/${Number(appealId)}/update-linked-appeals`, {
			json: data
		})
		.json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string | number} appealId
 * @returns {Promise<{}>}
 */
export function getAppealById(apiClient, appealId) {
	return apiClient.get(`appeals/${appealId}?include=appellant`).json();
}
