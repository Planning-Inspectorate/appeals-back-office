import { CONFIG_APPEAL_FOLDER_PATHS } from '#endpoints/constants.js';

/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */
/** @typedef {import('@pins/appeals/index.js').MappedDocument} MappedDocument */
/** @typedef {import('@pins/appeals/index.js').DocumentMetadata} DocumentMetadata */
/** @typedef {import('@pins/appeals/index.js').BlobInfo} BlobInfo */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo */

/**
 * @param {number} caseId
 * @param {string} blobStorageHost,
 * @param {string} blobStorageContainer,
 * @param {MappedDocument[]} documents
 * @returns {DocumentMetadata[]}
 */
export const mapDocumentsForDatabase = (
	caseId,
	blobStorageHost,
	blobStorageContainer,
	documents
) => {
	return documents?.map((document) => {
		return {
			name: document.documentName,
			caseId,
			folderId: document.folderId,
			mime: document.mimeType,
			documentType: document.documentType,
			documentSize: document.documentSize,
			stage: document.stage,
			blobStorageContainer,
			blobStorageHost
		};
	});
};

/**
 * @param {(DocumentVersion|null)[]} documents
 * @param {string} caseReference
 * @param {number} versionId
 * @returns {(BlobInfo|null)[]}
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
				blobStoreUrl: mapBlobPath(document.documentGuid, caseReference, fileName, versionId)
			};
		}

		return null;
	});
};

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
	// @ts-ignore
	return CONFIG_APPEAL_FOLDER_PATHS.map((/** @type {string} */ path) => {
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

	for (const path of CONFIG_APPEAL_FOLDER_PATHS) {
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
 * @returns {FolderInfo | void}
 */
const mapFoldersLayoutForAppealFolder = (folders, path) => {
	const folder = folders.find((f) => f.path === path);
	if (folder) {
		return {
			folderId: folder.id,
			path: folder.path,
			documents:
				folder.documents
					?.filter((d) => !d.isDeleted)
					.map((d) => {
						return {
							id: d.guid,
							name: d.name,
							folderId: d.folderId,
							caseId: folder.caseId,
							isLateEntry: d.latestDocumentVersion?.isLateEntry,
							virusCheckStatus: d.latestDocumentVersion?.virusCheckStatus
						};
					}) || []
		};
	}
};
