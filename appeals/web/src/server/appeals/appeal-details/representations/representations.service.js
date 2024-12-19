/** @typedef {import('pins-data-model/src/schemas.js').Representation} Representation */

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
