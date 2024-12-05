export const DOCUMENT_STAGE = 'appellant-case';
export const DOCUMENT_TYPE = 'appellantStatement';
/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').RepresentationRequest} RepresentationRequest */

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {RepresentationRequest} payload
 * @returns {Promise<any>}
 */
export async function postRepresentationComment(apiClient, appealId, payload) {
	try {
		const response = await apiClient.post(`appeals/${appealId}/reps/comments`, {
			json: payload
		});
		return response.body;
	} catch (error) {
		console.error('Error posting representation comment:', error);
		throw new Error('Failed to post representation comment');
	}
}
