/**
 * @typedef {Object} AllocationDetailsLevel
 * @property {string} level
 * @property {number} band
 */

/**
 * @typedef {Object} AllocationDetailsSpecialism
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef {Object} AllocationDetails
 * @property {number[]} specialisms
 * @property {string} level
 */

/**
 *
 * @param {import('got').Got} apiClient
 * @returns {Promise<AllocationDetailsLevel[]>}
 */
export const getAllocationDetailsLevels = (apiClient) =>
	apiClient.get('appeals/appeal-allocation-levels').json();

/**
 *
 * @param {import('got').Got} apiClient
 * @returns {Promise<AllocationDetailsSpecialism[]>}
 */
export const getAllocationDetailsSpecialisms = (apiClient) =>
	apiClient.get('appeals/appeal-allocation-specialisms').json();

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {AllocationDetails} allocationDetails
 * @returns {Promise<AllocationDetails>}
 */
export const setAllocationDetails = (apiClient, appealId, allocationDetails) =>
	apiClient.patch(`appeals/${appealId}/appeal-allocation`, { json: allocationDetails }).json();
