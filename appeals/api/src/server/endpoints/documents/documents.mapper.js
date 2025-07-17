import { FOLDERS } from '@pins/appeals/constants/documents.js';
import { formatFolder } from './documents.formatter.js';
import { randomUUID } from 'node:crypto';

/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */
/** @typedef {import('@pins/appeals/index.js').MappedDocument} MappedDocument */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo */

/**
 * @param {number} caseId
 * @param {string} blobStorageHost,
 * @param {string} blobStorageContainer,
 * @param {MappedDocument[]} documents
 * @returns
 */
export const mapDocumentsForDatabase = (
	caseId,
	blobStorageHost,
	blobStorageContainer,
	documents
) => {
	return documents?.map((document) => {
		const storageHost = mapHost(blobStorageHost || '');

		return {
			GUID: document.GUID,
			name:
				document.stage === 'representation'
					? `${randomUUID()}_${document.documentName}`
					: document.documentName,
			caseId,
			folderId: document.folderId,
			mime: document.mimeType,
			documentType: document.documentType,
			documentSize: document.documentSize,
			stage: document.stage,
			blobStorageHost: storageHost,
			blobStorageContainer,
			blobStoragePath: document.blobStoragePath,
			documentURI: `${storageHost}/${blobStorageContainer}/${document.blobStoragePath}`,
			redactionStatusId: document.redactionStatusId,
			dateReceived: new Date(document.receivedDate)
		};
	});
};

/**
 *
 * @param {string} original
 * @returns {string}
 */
const mapHost = (original) => {
	const host = original.replace(/\/$/, '');
	if (host.indexOf('?') > 0) {
		return host.split('?')[0];
	}

	return host;
};

/**
 * @param {(DocumentVersion|null)[]} documents
 * @param {string} caseReference
 * @param {number} versionId
 * @returns
 */
export const mapDocumentsForBlobStorage = (documents, caseReference, versionId = 1) => {
	return documents.map((document) => {
		if (document) {
			const fileName = document.fileName || document.documentGuid;
			return {
				caseType: 'appeal',
				caseReference,
				versionId,
				GUID: document.documentGuid,
				documentName: fileName,
				blobStoreUrl: document.blobStoragePath || ''
			};
		}

		return null;
	});
};

/**
 * @param {(DocumentVersion|null)[]} documents
 * @returns
 */
export const mapDocumentsForAuditTrail = (documents) =>
	documents.map((document) => {
		if (!document) {
			return null;
		}

		const fileName = document.fileName || document.documentGuid;
		return {
			documentName: fileName,
			documentType: document.documentType,
			GUID: document.documentGuid,
			redactionStatus: document.redactionStatus?.key,
			versionId: document.version
		};
	});

/**
 * @param {string} guid
 * @param {string} caseReference
 * @param {string} name
 * @param {number} versionId
 * @returns {string}
 */
export const mapBlobPath = (guid, caseReference, name, versionId = 1) => {
	return `appeal/${mapCaseReferenceForStorageUrl(caseReference)}/${guid}/v${versionId}/${name}`;
};

/**
 * @type {(caseReference: string) => string}
 */
export const mapCaseReferenceForStorageUrl = (caseReference) => {
	return caseReference.replace(/\//g, '-');
};

/**
 * Returns a list of document paths available for the current Appeal
 * @param {number} caseId
 * @returns {Folder[]}
 */
export const mapDefaultCaseFolders = (caseId) => {
	return FOLDERS.map((/** @type {string} */ path) => {
		return {
			caseId,
			path
		};
	});
};

/**
 * @param {string} sectionName
 * @param {Folder[]} folders
 * @returns {Object<string, Object>}
 */
export const mapFoldersLayoutForAppealSection = (sectionName, folders) => {
	/** @type {Object<string, Object>} **/ const folderLayout = {};

	for (const path of FOLDERS) {
		if (path.indexOf(sectionName) === 0) {
			const key = path.replace(`${sectionName}/`, '');
			folderLayout[key] = mapFoldersLayoutForAppealFolder(folders, `${sectionName}/${key}`) || {};
		}
	}

	return folderLayout;
};

/**
 * @param {Folder[]} folders
 * @param {string} path
 * @returns {{ folderId: Number, path: string, documents: Object} | void}
 */
const mapFoldersLayoutForAppealFolder = (folders, path) => {
	const folder = folders.find((f) => f.path === path);
	if (folder) {
		return formatFolder(folder);
	}
};
