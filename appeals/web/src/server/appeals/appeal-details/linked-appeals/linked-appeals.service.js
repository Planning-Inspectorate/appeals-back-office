import { LINK_APPEALS_UNLINK_OPERATION } from '@pins/appeals/constants/support.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string | number} appealId
 * @param {string} [appealRefToReplaceLead]
 * @param {string} [operation]
 * @returns {Promise<{}>}
 */
export function postUpdateLinkedAppealsRequest(
	apiClient,
	appealId,
	appealRefToReplaceLead,
	operation = LINK_APPEALS_UNLINK_OPERATION
) {
	const data = { operation };

	if (appealRefToReplaceLead) {
		// @ts-ignore
		data.appealRefToReplaceLead = appealRefToReplaceLead;
	}

	return apiClient
		.post(`appeals/${Number(appealId)}/update-linked-appeals`, {
			json: data
		})
		.json();
}
