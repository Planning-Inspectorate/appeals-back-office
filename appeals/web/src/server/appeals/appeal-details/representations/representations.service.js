/** @typedef {import('./types.js').Representation} Representation */

import logger from '#lib/logger.js';

/**
 * Fetch counts of appeal representations by type
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string|undefined} statusFilter
 * @returns {Promise<{ [key: string]: number }>}
 */
export const getRepresentationCounts = (apiClient, appealId, statusFilter = 'all') => {
	let url = `appeals/${appealId}/reps/count`;

	if (statusFilter && statusFilter !== 'all') {
		url += `?status=${encodeURIComponent(statusFilter)}`;
	}

	return apiClient.get(url).json();
};

/**
 * Fetch unique representations (eg final comments) based on appeal id and representation type
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} type
 * @returns {Promise<Representation>}
 */
export const getSingularRepresentationByType = async (apiClient, appealId, type) => {
	const url = `appeals/${appealId}/reps?type=${type}`;
	const apiResponse = await apiClient.get(url).json();

	if (apiResponse.items.length > 1) {
		logger.warn(`Multiple representations of type ${type} found on appeal ${appealId}`);
	}

	return apiResponse.items[0];
};

/**
 * @param {import('got').Got} apiClient
 * @param {number|string} appealId
 * @param {number|string} repId
 * @param {string} status
 * @returns {Promise<Representation>}
 * */
export const setRepresentationStatus = (apiClient, appealId, repId, status) =>
	apiClient.patch(`appeals/${appealId}/reps/${repId}`, { json: { status } }).json();

/**
 * @param {import('got').Got} apiClient
 * @param {number|string} appealId
 * @param {number} repId
 * @param {string} redactedRepresentation
 * @returns {Promise<Representation>}
 * */
export const redactAndAccept = (apiClient, appealId, repId, redactedRepresentation) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${repId}`, {
			json: {
				status: 'valid',
				redactedRepresentation
			}
		})
		.json();

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {number} repId
 * @returns {Promise<Representation>}
 * */
export const acceptRepresentation = (apiClient, appealId, repId) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${repId}`, {
			json: { status: 'valid' }
		})
		.json();

/**
 * @param {import('got').Got} apiClient
 * @param {string} representationType
 * @returns {Promise<import('@pins/appeals.api').Appeals.RepresentationRejectionReason[]>}
 */
export async function getRepresentationRejectionReasonOptions(apiClient, representationType) {
	return apiClient
		.get(`appeals/representation-rejection-reasons?type=${representationType}`)
		.json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {import('#appeals/appeal-details/representations/types.js').RejectionReasonUpdateInput[]} rejectionReasons
 * */
export const updateRejectionReasons = (apiClient, appealId, commentId, rejectionReasons) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}/rejection-reasons`, {
			json: { rejectionReasons }
		})
		.json();

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {'lpa_statement' | 'final_comment'} type
 * @returns {Promise<Representation[]>}
 * */
export const publishRepresentations = (apiClient, appealId, type) =>
	apiClient.post(`appeals/${appealId}/reps/publish?type=${type}`).json();
