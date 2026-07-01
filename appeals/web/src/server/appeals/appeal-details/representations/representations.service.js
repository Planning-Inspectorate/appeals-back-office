/** @typedef {import('./types.js').Representation} Representation */
/** @typedef {import('#appeals/appeal-details/representations/types.js').RepresentationRequest} RepresentationRequest */

import logger from '#lib/logger.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 * Fetch unique representations (eg final comments) based on appeal id and representation type
 *
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {string} type
 * @returns {Promise<Representation>}
 */
export const getSingularRepresentationByType = async (apiClient, appealId, type) => {
	const ids = assertValidNumericIds({ appealId });
	const url = `appeals/${ids.appealId}/reps?type=${type}`;
	const apiResponse = await apiClient.get(url).json();

	if (apiResponse.itemCount > 1) {
		const validReps = apiResponse.items.filter(
			(/** @type {{ status: string; }} */ rep) => rep.status !== 'invalid'
		);
		if (validReps.length !== 1) {
			logger.warn(`Multiple valid representations of type ${type} found on appeal ${appealId}`);
		}
		return validReps[0];
	}
	return apiResponse.items[0];
};

/**
 *
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {string} types
 */
export const getRepresentationsByTypes = async (apiClient, appealId, types) => {
	const ids = assertValidNumericIds({ appealId });
	const url = `appeals/${ids.appealId}/reps?type=${types}`;
	const apiResponse = await apiClient.get(url).json();
	if (apiResponse.itemCount === 0) {
		return {};
	}

	const groupedReps = apiResponse.items.reduce(
		/**
		 * @typedef {import("./types.js").Representation} Representation
		 *
		 * @param {Record<string, Representation[]>} formattedReps
		 * @param {Representation} rep
		 */
		(formattedReps, rep) => {
			(formattedReps[rep.representationType] ||= []).push(rep);
			return formattedReps;
		},
		{}
	);

	const selected = Object.fromEntries(
		Object.entries(groupedReps).map(([type, items]) => {
			if (items.length > 1) {
				logger.warn(`Multiple representations of type ${type} found on appeal ${appealId}`);
			}
			return [type, items[0]];
		})
	);

	return selected;
};

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {string} type
 * @returns {Promise<Representation[]>}
 */
export const getAllRepresentationsByType = async (apiClient, appealId, type) => {
	const ids = assertValidNumericIds({ appealId });
	const apiResponse = await apiClient.get(`appeals/${ids.appealId}/reps?type=${type}`).json();
	return apiResponse.items;
};

/**
 * @param {import('got').Got} apiClient
 * @param {number|string} appealId
 * @param {number|string} repId
 * @param {string} status
 * @returns {Promise<Representation>}
 * */
export const setRepresentationStatus = (apiClient, appealId, repId, status) => {
	const ids = assertValidNumericIds({ appealId, repId });
	return apiClient.patch(`appeals/${ids.appealId}/reps/${repId}`, { json: { status } }).json();
};

/**
 * @param {import('got').Got} apiClient
 * @param {number|string} appealId
 * @param {number} repId
 * @param {string} redactedRepresentation
 * @returns {Promise<Representation>}
 * */
export const redactAndAccept = (apiClient, appealId, repId, redactedRepresentation) => {
	const ids = assertValidNumericIds({ appealId, repId });
	return apiClient
		.patch(`appeals/${ids.appealId}/reps/${repId}`, {
			json: {
				status: 'valid',
				redactedRepresentation
			}
		})
		.json();
};

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {number} repId
 * @returns {Promise<Representation>}
 * */
export const acceptRepresentation = (apiClient, appealId, repId) => {
	const ids = assertValidNumericIds({ appealId, repId });
	return apiClient
		.patch(`appeals/${ids.appealId}/reps/${repId}`, {
			json: { status: 'valid' }
		})
		.json();
};

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {number} repId
 * @param {{ allowResubmit: boolean }} data
 * @returns {Promise<Representation>}
 * */
export const representationIncomplete = (apiClient, appealId, repId, { allowResubmit }) => {
	const ids = assertValidNumericIds({ appealId, repId });
	return apiClient
		.patch(`appeals/${ids.appealId}/reps/${repId}`, {
			json: { status: 'incomplete', allowResubmit }
		})
		.json();
};

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
export const updateRejectionReasons = (apiClient, appealId, commentId, rejectionReasons) => {
	const ids = assertValidNumericIds({ appealId, commentId });
	return apiClient
		.patch(`appeals/${ids.appealId}/reps/${commentId}/rejection-reasons`, {
			json: { rejectionReasons }
		})
		.json();
};

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @returns {Promise<any>}
 * */
export const publishRepresentations = (apiClient, appealId) => {
	const ids = assertValidNumericIds({ appealId });
	return apiClient.post(`appeals/${ids.appealId}/reps/publish`).json();
};

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {RepresentationRequest} payload
 * @param {string} representationType
 * @returns {Promise<any>}
 */
export async function postRepresentation(apiClient, appealId, payload, representationType) {
	try {
		const ids = assertValidNumericIds({ appealId });
		const response = await apiClient
			.post(`appeals/${ids.appealId}/reps/${representationType}`, {
				json: payload
			})
			.json();
		return response.body;
	} catch (error) {
		logger.error('Error posting representation:', error);
		throw new Error('Failed to post representation');
	}
}
