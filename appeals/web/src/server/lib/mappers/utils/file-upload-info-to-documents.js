import config from '@pins/appeals.web/environment/config.js';

/** @typedef {import('@pins/appeals/index.js').AddDocumentsRequest} AddDocumentsRequest */

/**
 * @param {Object} params
 * @param {string|number} params.caseId
 * @param {number} params.folderId
 * @param {number} [params.redactionStatus]
 * @param {{ files: { GUID: string, name: string, documentType: string, size: number, stage: string, mimeType: string, receivedDate: string, redactionStatus: number, blobStoreUrl: string }[] }} params.fileUploadInfo - The file upload information object.
 * @returns {AddDocumentsRequest}
 */
export const mapFileUploadInfoToMappedDocuments = ({
	caseId,
	folderId,
	redactionStatus,
	fileUploadInfo
}) => {
	const blobStorageHost = config.useBlobEmulator
		? config.blobEmulatorSasUrl
		: config.blobStorageUrl;
	return {
		blobStorageHost,
		blobStorageContainer: config.blobStorageDefaultContainer,
		documents: fileUploadInfo.files.map(
			/** @type {import('#lib/ts-utilities.js').FileUploadInfoItem} */
			(file) =>
				/** @type {import('@pins/appeals/index.js').MappedDocument} */
				({
					caseId,
					documentName: file.name,
					documentType: file.documentType,
					mimeType: file.mimeType,
					documentSize: file.size,
					stage: file.stage,
					folderId,
					GUID: file.GUID,
					receivedDate: file.receivedDate,
					redactionStatusId: redactionStatus || 1,
					blobStoragePath: file.blobStoreUrl
				})
		)
	};
};
