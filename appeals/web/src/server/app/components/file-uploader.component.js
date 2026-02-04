import logger from '#lib/logger.js';

/** @typedef {import('@pins/appeals/index.js').AddDocumentsRequest} AddDocumentsRequest */
/** @typedef {import('@pins/appeals/index.js').AddDocumentVersionRequest} AddDocumentVersionRequest */
/** @typedef {import('@pins/appeals/index.js').AddDocumentsResponse} AddDocumentsResponse */

/**
 * @param {import('got').Got} apiClient
 * @param {string|number} caseId
 * @param {AddDocumentsRequest} payload
 * @returns {Promise<AddDocumentsResponse|undefined>}
 */
export const createNewDocument = async (apiClient, caseId, payload) => {
	try {
		const result = await apiClient.post(`appeals/${caseId}/documents`, { json: payload }).json();
		return result;
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'An error occurred while attempting to post to appeals/${caseId}/documents API endpoint'
		);
		throw error;
	}
};

/**
 * @param {import('got').Got} apiClient
 * @param {string} caseId
 * @param {string} documentId
 * @param {AddDocumentVersionRequest} payload
 * @returns {Promise<AddDocumentsResponse>}
 */
export const createNewDocumentVersion = async (apiClient, caseId, documentId, payload) => {
	const result = apiClient
		.post(`appeals/${caseId}/documents/${documentId}`, { json: payload })
		.json();
	return result;
};
