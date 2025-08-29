/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */
/** @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo */
/** @typedef {import('@pins/appeals.api').Appeals.DocumentInfo} DocumentInfo */
/** @typedef {import('@pins/appeals.api').Appeals.DocumentVersionInfo} DocumentVersionInfo */

import { getAvScanStatus } from './documents.service.js';

/**
 * @param {Folder|undefined} folder
 * @returns {FolderInfo|undefined}
 */
const formatFolder = (folder) => {
	if (folder) {
		return {
			caseId: folder.caseId.toString(),
			documents:
				folder.documents
					?.filter((document) => {
						return document.isDeleted === false;
					})
					.map((document) => formatDocument(document)) || null,
			folderId: folder.id,
			path: folder.path
		};
	}
};

/**
 * @param {Document} document
 * @returns {DocumentInfo}
 */
const formatDocument = (document) => {
	// @ts-ignore
	return {
		caseId: document.caseId,
		folderId: document.folderId,
		id: document.guid,
		name:
			document.latestDocumentVersion?.documentType !== null
				? document.name.replace(/[a-f\d-]{36}_/, '')
				: document.name,
		isDeleted: document.isDeleted,
		createdAt: document.createdAt?.toISOString() || '',
		versionAudit: document.versionAudit || [],
		...(document.latestDocumentVersion && {
			latestDocumentVersion: formatDocumentVersion(document.latestDocumentVersion)
		}),
		...(document.versions && {
			allVersions: document.versions?.map((v) => formatDocumentVersion(v))
		})
	};
};

/**
 * @param {DocumentVersion} latestDocumentVersion
 * @returns {DocumentVersionInfo | undefined}
 */
const formatDocumentVersion = (latestDocumentVersion) => {
	if (!latestDocumentVersion) {
		return;
	}
	return {
		documentId: latestDocumentVersion.documentGuid,
		version: latestDocumentVersion.version,
		fileName: latestDocumentVersion.fileName || '',
		originalFilename: latestDocumentVersion.originalFilename
			? latestDocumentVersion.originalFilename.replace(/[a-f\d-]{36}_/, '')
			: '',
		dateReceived: latestDocumentVersion.dateReceived?.toISOString() || '',
		redactionStatus: latestDocumentVersion.redactionStatus?.name || '',
		virusCheckStatus: getAvScanStatus(latestDocumentVersion),
		size: latestDocumentVersion?.size?.toString() || '',
		mime: latestDocumentVersion?.mime || '',
		isLateEntry: latestDocumentVersion?.isLateEntry,
		isDeleted: latestDocumentVersion?.isDeleted,
		documentType: latestDocumentVersion?.documentType || '',
		stage: latestDocumentVersion?.stage || '',
		blobStorageContainer: latestDocumentVersion?.blobStorageContainer || '',
		blobStoragePath: latestDocumentVersion?.blobStoragePath || '',
		documentURI: latestDocumentVersion?.documentURI || ''
	};
};

export { formatDocument, formatFolder };
