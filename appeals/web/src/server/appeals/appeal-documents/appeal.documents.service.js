import logger from '#lib/logger.js';
import { fileType } from '#lib/nunjucks-filters/mime-type.js';

/** @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo */
/** @typedef {import('@pins/appeals.api').Appeals.DocumentInfo} DocumentInfo */
/** @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} DocumentRedactionStatus */

/**
 * @param {import('got').Got} apiClient
 * @param {string|number} appealId
 * @returns {Promise<FolderInfo[]|undefined>}
 */
export const getAllCaseFolders = async (apiClient, appealId) => {
	try {
		const bulkLocationInfo = await apiClient.get(`appeals/${appealId}/document-folders`).json();
		return bulkLocationInfo;
	} catch {
		return undefined;
	}
};

/**
 * @param {import('got').Got} apiClient
 * @param {string|number} appealId
 * @param {string|number} folderId
 * @param {string|number} [repId]
 * @returns {Promise<FolderInfo|undefined>}
 */
export const getFolder = async (apiClient, appealId, folderId, repId) => {
	try {
		const query = repId ? `?repId=${repId}` : '';
		const url = `appeals/${appealId}/document-folders/${folderId}${query}`;

		const locationInfo = await apiClient.get(url).json();
		return locationInfo;
	} catch {
		return undefined;
	}
};

/**
 * @param {import('got').Got} apiClient
 * @param {string|number} appealId
 * @param {string} folderPath
 * @returns {Promise<FolderInfo|undefined>}
 * */
export const getAttachmentsFolder = async (apiClient, appealId, folderPath) => {
	const folders = await apiClient
		.get(`appeals/${appealId}/document-folders?path=${folderPath}`)
		.json();
	if (!(folders && folders.length > 0)) {
		throw new Error(`failed to find folder for appeal ID ${appealId}`);
	}

	return folders[0];
};

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} fileGuid
 * @returns {Promise<DocumentInfo|undefined>}
 */
export const getFileInfo = async (apiClient, appealId, fileGuid) => {
	try {
		const fileInfo = await apiClient.get(`appeals/${appealId}/documents/${fileGuid}`).json();
		return fileInfo;
	} catch {
		return undefined;
	}
};

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} fileGuid
 * @returns {Promise<DocumentInfo|undefined>}
 */
export const getFileVersionsInfo = async (apiClient, appealId, fileGuid) => {
	try {
		const fileInfo = await apiClient
			.get(`appeals/${appealId}/documents/${fileGuid}/versions`)
			.json();
		return fileInfo;
	} catch {
		return undefined;
	}
};

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} fileGuid
 * @returns {Promise<string|null>}
 */
export const getDocumentFileType = async (apiClient, appealId, fileGuid) => {
	const versionsInfo = await getFileVersionsInfo(apiClient, appealId, fileGuid);
	if (!versionsInfo) {
		return null;
	}

	return fileType(versionsInfo.latestDocumentVersion.mime);
};

/**
 * @param {import('got').Got} apiClient
 * @returns {Promise<DocumentRedactionStatus[]|undefined>}
 */
export const getDocumentRedactionStatuses = async (apiClient) => {
	try {
		return await apiClient.get('appeals/document-redaction-statuses').json();
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'An error occurred while attempting to get document redaction statuses from the API'
		);
	}
};

/**
 * @typedef {Object} DocumentDetailAPIDocument
 * @property {string} id
 * @property {string} fileName
 */

/**
 * @typedef {Object} DocumentDetailAPIPatchRequest
 * @property {DocumentDetailAPIDocument} document
 */

/**
 * @typedef {Object} DocumentDetailAPIPatchResponse
 * @property {DocumentDetailAPIDocument} document
 */

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {DocumentDetailAPIPatchRequest} documentDetail
 * @returns {Promise<DocumentDetailAPIPatchResponse|undefined>}
 */

export const updateDocument = async (apiClient, appealId, documentDetail) => {
	try {
		return await apiClient
			.patch(`appeals/${appealId}/documents/${documentDetail.document.id}`, {
				json: {
					document: documentDetail.document
				}
			})
			.json();
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'An error occurred while attempting to patch the document API endpoint'
		);
	}
};

/**
 * @typedef {Object} DocumentDetailsAPIDocument
 * @property {string} id
 * @property {string} receivedDate
 * @property {number} redactionStatus
 */

/**
 * @typedef {Object} DocumentDetailsAPIPatchRequest
 * @property {DocumentDetailsAPIDocument[]} documents
 */

/**
 * @typedef {Object} DocumentDetailsAPIPatchResponse
 * @property {DocumentDetailsAPIDocument[]} documents
 */

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {DocumentDetailsAPIPatchRequest} documentDetails
 * @returns {Promise<DocumentDetailsAPIPatchResponse|undefined>}
 */
export const updateDocuments = async (apiClient, appealId, documentDetails) => {
	try {
		return await apiClient
			.patch(`appeals/${appealId}/documents`, {
				json: documentDetails
			})
			.json();
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'An error occurred while attempting to patch the documents API endpoint'
		);
	}
};

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} documentId
 * @param {string} versionId
 * @returns {Promise<Document|undefined>}
 */
export const deleteDocument = async (apiClient, appealId, documentId, versionId) => {
	try {
		return await apiClient
			.delete(`appeals/${appealId}/documents/${documentId}/${versionId}`)
			.json();
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: `An error occurred while attempting to delete the document`
		);
	}
};
