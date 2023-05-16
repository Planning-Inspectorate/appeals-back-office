import { patch } from '../../lib/request.js';
/** @typedef {import('../appeal-details/appeal-details.types').Appeal} Appeal */

/**
 *
 * @param {string} appealId
 * @param {object} data
 * @returns {Promise<Appeal>}
 */
export function setStartDateById(appealId, data) {
	return patch(`appeals/${appealId}`, { json: data });
}
