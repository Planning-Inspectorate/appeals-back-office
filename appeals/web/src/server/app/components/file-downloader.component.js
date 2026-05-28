import { generateAllPdfs } from '#app/components/download-all-generated-pdfs.component.js';
import {
	getAllCaseFolders,
	getFileInfo,
	getFileVersionsInfo,
	getRepresentationAttachments
} from '#appeals/appeal-documents/appeal.documents.service.js';
import getActiveDirectoryAccessToken from '#lib/active-directory-token.js';
import logger from '#lib/logger.js';
import { camelCaseToWords, toSentenceCase } from '#lib/string-utilities.js';
import { BlobServiceClient } from '@azure/storage-blob';
import config from '@pins/appeals.web/environment/config.js';
import { REP_ATTACHMENT_DOCTYPE } from '@pins/appeals/constants/documents.js';
import { BlobStorageClient } from '@pins/blob-storage-client';
import { APPEAL_CASE_STAGE, APPEAL_VIRUS_CHECK_STATUS } from '@planning-inspectorate/data-model';
import archiver from 'archiver';
import path from 'node:path';

/** @typedef {import('../auth/auth-session.service').SessionWithAuth} SessionWithAuth */
/** @typedef {import('#appeals/appeal-details/appeal-details.types.d.ts').WebAppeal} WebAppeal */
/** @typedef {import('express').Response} Response */

const validScanResult = APPEAL_VIRUS_CHECK_STATUS.SCANNED;

// file types already compressed so no benefit in running through zip compression
const storeTypes = new Set([
	'pdf',
	'docx',
	'pptx',
	'xlsx',
	'jpg',
	'jpeg',
	'png',
	'tif',
	'tiff',
	'mpeg',
	'mp3',
	'mp4',
	'mov'
]);

/**
 * Create a new blob storage client
 *
 * @param {SessionWithAuth} session
 * @returns {Promise<*>}
 */
const createBlobStorageClient = async (session) => {
	if (config.useBlobEmulator === true) {
		return new BlobStorageClient(new BlobServiceClient(config.blobEmulatorSasUrl));
	} else {
		const accessToken = await getActiveDirectoryAccessToken(session);
		return BlobStorageClient.fromUrlAndToken(config.blobStorageUrl, accessToken);
	}
};

/**
 * Download one document or redirects to its url if filename is provided
 *
 * @param {{apiClient: import('got').Got, params: {caseId: string, guid: string, filename?: string}, session: SessionWithAuth}} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getDocumentDownload = async ({ apiClient, params, session }, response) => {
	const { guid: fileGuid, filename: requestedFilename } = params;

	const fileInfo = await getFileInfo(apiClient, fileGuid);

	if (!fileInfo?.latestDocumentVersion) {
		return response.status(404);
	}

	const { blobStorageContainer, blobStoragePath, virusCheckStatus } =
		fileInfo.latestDocumentVersion;
	if (!blobStorageContainer || !blobStoragePath) {
		throw new Error('Blob storage container or Blob storage path not found');
	}

	if (virusCheckStatus !== validScanResult) {
		throw new Error('Document cannot be downloaded, incorrect AV scan result');
	}

	const blobStorageClient = await createBlobStorageClient(session);
	const documentKey = blobStoragePath.startsWith('/') ? blobStoragePath.slice(1) : blobStoragePath;
	const extractedFilename = `${documentKey}`.split(/\/+/).pop();

	const blobProperties = await blobStorageClient.getBlobProperties(
		blobStorageContainer,
		documentKey
	);
	if (!blobProperties) {
		return response.status(404);
	}

	if (requestedFilename && blobProperties?.contentType) {
		response.setHeader('content-type', blobProperties.contentType);
	} else {
		response.setHeader('content-disposition', `attachment; filename=${extractedFilename}`);
	}

	const blobStream = await blobStorageClient.downloadStream(blobStorageContainer, documentKey);

	if (!blobStream?.readableStreamBody) {
		throw new Error(`Document ${documentKey} missing stream body`);
	}

	blobStream.readableStreamBody?.pipe(response);

	return response.status(200);
};

/**
 * Download one uncommitted document
 *
 * @param {{ params: { caseReference: string, guid: string, filename: string, version: string | undefined }, session: SessionWithAuth }} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getUncommittedDocumentDownload = async (
	{ params: { caseReference, guid, filename: requestedFilename, version }, session },
	response
) => {
	const blobStorageClient = await createBlobStorageClient(session);
	const documentKey = `appeal/${caseReference}/${guid}/v${version || 1}/${requestedFilename}`;
	const extractedFilename = `${documentKey}`.split(/\/+/).pop();

	const blobProperties = await blobStorageClient.getBlobProperties(
		config.blobStorageDefaultContainer,
		documentKey
	);
	if (!blobProperties) {
		return response.status(404);
	}

	if (blobProperties?.contentType) {
		response.setHeader('content-type', blobProperties.contentType);
	} else {
		response.setHeader('content-disposition', `attachment; filename=${extractedFilename}`);
	}

	const blobStream = await blobStorageClient.downloadStream(
		config.blobStorageDefaultContainer,
		documentKey
	);

	if (!blobStream?.readableStreamBody) {
		throw new Error(`Document ${documentKey} missing stream body`);
	}

	blobStream.readableStreamBody?.pipe(response);

	return response.status(200);
};

/**
 * Download one document or redirects to its url if filename is provided
 *
 * @param {{apiClient: import('got').Got, params: {caseId: string, guid: string, filename?: string, version: string}, session: SessionWithAuth}} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getDocumentDownloadByVersion = async ({ apiClient, params, session }, response) => {
	const { guid: fileGuid, filename: requestedFilename, version } = params;

	const filesInfo = await getFileVersionsInfo(apiClient, fileGuid);

	if (!filesInfo?.allVersions) {
		return response.status(404);
	}

	const fileToDownloadInfo = filesInfo.allVersions.find((fileInfo) => {
		return fileInfo.version?.toString() === version;
	});

	if (!fileToDownloadInfo) {
		return response.status(404);
	}

	const { blobStorageContainer, blobStoragePath, virusCheckStatus } = fileToDownloadInfo;

	if (!blobStorageContainer || !blobStoragePath) {
		throw new Error('Blob storage container or Blob storage path not found');
	}

	if (virusCheckStatus !== validScanResult) {
		throw new Error('Document cannot be downloaded, incorrect AV scan result');
	}

	const blobStorageClient = await createBlobStorageClient(session);
	const documentKey = blobStoragePath.startsWith('/') ? blobStoragePath.slice(1) : blobStoragePath;
	const extractedFilename = `${documentKey}`.split(/\/+/).pop();

	const blobProperties = await blobStorageClient.getBlobProperties(
		blobStorageContainer,
		documentKey
	);
	if (!blobProperties) {
		return response.status(404);
	}

	if (requestedFilename && blobProperties?.contentType) {
		response.setHeader('content-type', blobProperties.contentType);
	} else {
		response.setHeader('content-disposition', `attachment; filename=${extractedFilename}`);
	}

	const blobStream = await blobStorageClient.downloadStream(blobStorageContainer, documentKey);

	if (!blobStream?.readableStreamBody) {
		throw new Error(`Document ${documentKey} missing stream body`);
	}

	blobStream.readableStreamBody?.pipe(response);

	return response.status(200);
};

/**
 * Create a blob download stream
 *
 * @param {import('@pins/blob-storage-client').BlobStorageClient} blobStorageClient
 * @param {string} blobStorageContainer
 * @param {string} blobStoragePath
 * @returns {Promise<Buffer|null>}
 */
const createBlobDownloadStream = async (
	blobStorageClient,
	blobStorageContainer,
	blobStoragePath
) => {
	const documentKey = blobStoragePath.startsWith('/') ? blobStoragePath.slice(1) : blobStoragePath;

	let blobProperties;
	try {
		blobProperties = await blobStorageClient.getBlobProperties(blobStorageContainer, documentKey);

		if (!blobProperties) {
			return null;
		}
	} catch (error) {
		console.error(`Error getting blob properties for ${documentKey}:`, error);
		return null;
	}

	const blobDownloadResponseParsed = await blobStorageClient.downloadStream(
		blobStorageContainer,
		documentKey
	);

	if (!blobDownloadResponseParsed?.readableStreamBody) {
		throw new Error(`Document ${documentKey} missing stream body`);
	}

	// @ts-ignore
	return blobDownloadResponseParsed.blobDownloadStream;
};

/**
 * @param {import('archiver').Archiver} archive
 * @param {import('@pins/blob-storage-client').BlobStorageClient} blobStorageClient
 * @param {Array<{blobStorageContainer: string, blobStoragePath: string, fullName: string}>} bulkFileInfo
 * @param {string[]} missingFiles
 */
const addBlobsToArchive = async (archive, blobStorageClient, bulkFileInfo, missingFiles) => {
	let nextDownloadPromise = null;
	for (let i = 0; i < bulkFileInfo.length; i++) {
		const fileInfo = bulkFileInfo[i];

		let downloadPromise;
		if (nextDownloadPromise) {
			downloadPromise = nextDownloadPromise;
			nextDownloadPromise = null;
		} else {
			downloadPromise = createBlobDownloadStream(
				blobStorageClient,
				fileInfo.blobStorageContainer,
				fileInfo.blobStoragePath
			);
		}

		// Start next download in background so it's ready when for next loop after append completes
		if (i + 1 < bulkFileInfo.length) {
			const nextInfo = bulkFileInfo[i + 1];
			nextDownloadPromise = createBlobDownloadStream(
				blobStorageClient,
				nextInfo.blobStorageContainer,
				nextInfo.blobStoragePath
			);
		}

		const blobStream = await downloadPromise;
		if (!blobStream) {
			missingFiles.push(fileInfo.fullName);
			continue;
		}

		// block loop until archive.append completes
		await new Promise((resolve, reject) => {
			const onArchiveEntry = () => {
				// remove error listener to prevent listener leak
				archive.removeListener('error', onArchiveError);
				// promise resolves can progress to next file in loop
				resolve(1);
			};
			const onArchiveError = (/** @type {Error} */ err) => {
				// remove entry listener to prevent listener leak
				archive.removeListener('entry', onArchiveEntry);
				reject(err);
			};
			// emitted after file has been added to archive
			archive.once('entry', onArchiveEntry);
			archive.once('error', onArchiveError);

			// avoid compression on given file types as they get no benefit from compression
			const ext = path.extname(fileInfo.fullName).slice(1).toLowerCase();
			const store = storeTypes.has(ext);
			archive.append(blobStream, { name: fileInfo.fullName, store });
		});
	}
};

/**
 * Build a zipped file and Download
 *
 * @param {{apiClient: import('got').Got, params: {caseId: string, filename?: string, representationType?: string}, session: SessionWithAuth, currentAppeal: WebAppeal}} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getBulkDocumentDownload = async (
	{ apiClient, params, session, currentAppeal },
	response
) => {
	const { filename = '', caseId, representationType = '' } = params;
	const zipFileName = buildZipFileName(caseId, filename);

	// avg 61MB total for 52 docs
	// max 3825MB for 1743 docs
	const timeoutMs = 2 * 60 * 60 * 1000; // 2 hours
	response.req.setTimeout(timeoutMs);
	response.setHeader('content-type', 'application/zip');
	response.setHeader('content-disposition', `attachment; filename=${zipFileName}`);

	const archive = archiver('zip', {
		zlib: { level: 1 } // compression level 1 to avoid excessive cpu usage
	});
	archive.on('warning', function (err) {
		if (err.code === 'ENOENT') {
			logger.warn(err, 'Archiver warning:');
		} else {
			throw err;
		}
	});
	archive.on('error', function (err) {
		throw err;
	});
	archive.pipe(response);

	try {
		const bulkFileInfo = await getBulkFileInfo(apiClient, caseId, representationType);
		const blobStorageClient = bulkFileInfo?.length ? await createBlobStorageClient(session) : null;
		const /** @type {string[]} */ missingFiles = [];

		if (bulkFileInfo?.length) {
			await addBlobsToArchive(archive, blobStorageClient, bulkFileInfo, missingFiles);
		} else {
			missingFiles.push('No documents found in this case');
		}

		// get PDFs
		if (config.featureFlags.featureFlagPdfDownload) {
			const successfulPdfs = await generateAllPdfs(currentAppeal, apiClient, representationType);
			successfulPdfs.forEach((pdf) => {
				if (!pdf.buffer) return;
				archive.append(pdf.buffer, { name: pdf.name });
			});
		}

		if (missingFiles.length) {
			archive.append(Buffer.from(JSON.stringify(missingFiles)), { name: 'missing-files.json' });
		}

		await archive.finalize();
		return response.status(200).send();
	} catch (error) {
		if (archive && !archive.destroyed) {
			archive.destroy();
		}

		logger.error(error, 'Error during bulk document download:');
		return response.destroy();
	}
};

/**
 * Build a zipped file name
 *
 * @param {string} caseId
 * @param {string} filename
 * @returns {string}
 */
const buildZipFileName = (caseId, filename) => {
	if (!filename) filename = `${caseId}.zip`;
	if (!filename.endsWith('.zip')) filename += '.zip';

	const timestampTokens = new Date().toISOString().split('T');
	const dateString = timestampTokens[0].replaceAll('-', '');
	const timeString = timestampTokens[1].split('.')[0].replaceAll(':', '');

	return filename?.replace('.zip', `_${dateString}${timeString}.zip`);
};

/**
 * Get all representation's documents
 *
 * @param {import('got').Got} apiClient
 * @param {string} caseId
 * @returns {Promise<*>}
 */

export const getRepresentationAttachmentFullNames = async (apiClient, caseId) => {
	const representations = await getRepresentationAttachments(apiClient, caseId);
	const fullAttachmentNames = {};
	const statusCounts = {};

	// @ts-ignore
	representations?.items?.forEach((representation) => {
		// Skip comments with invalid status
		if (representation.representationType === 'comment' && representation.status === 'invalid') {
			return; // Skip this representation
		}
		let representationStatus = representation.status;
		if (representation.status === 'valid') {
			representationStatus = 'accepted';
		} else if (representation.status === 'invalid') {
			representationStatus = 'rejected';
		}

		// Keep a count of each representation type and status so that we can give each ip comment a unique folder name
		const statusCountKey = `${representation.representationType}-${representation.status}`;
		// @ts-ignore
		if (statusCounts[statusCountKey] === undefined) {
			// @ts-ignore
			statusCounts[statusCountKey] = 0;
		}

		const representationType =
			representation.representationType === 'comment'
				? `Interested party comments/${toSentenceCase(
						representationStatus
						// @ts-ignore
					)}/Comment ${++statusCounts[statusCountKey]}`
				: toSentenceCase(representation.representationType).replace('Lpa', 'LPA');

		// @ts-ignore
		representation.attachments.forEach((attachment) => {
			const { document } = attachment.documentVersion || {};
			// @ts-ignore
			fullAttachmentNames[document.guid] = `Representations/${representationType}/${document.name}`;
		});
	});
	return fullAttachmentNames;
};

/**
 * Get document subset
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<*>}
 */
const getRepresentationFolder = async (apiClient, appealId) => {
	try {
		return await apiClient
			.get(`appeals/${appealId}/document-folders?path=representation/${REP_ATTACHMENT_DOCTYPE}`)
			.json();
	} catch {
		return undefined;
	}
};

/**
 * Get bulk file info for a representation type
 *
 * @param {import('got').Got} apiClient
 * @param {string} caseId
 * @param {string} representationType
 * @returns {Promise<*>}
 */
export const getBulkFileInfo = async (apiClient, caseId, representationType) => {
	const representationAttachmentFullNames = await getRepresentationAttachmentFullNames(
		apiClient,
		caseId
	);

	/** @type {Array<{path: string, documents: Array<{latestDocumentVersion: {blobStorageContainer: string, blobStoragePath: string, documentURI: string}, name: string, id?: string, guid: string}>}>} */
	const folders = representationType
		? await getRepresentationFolder(apiClient, caseId)
		: await getAllCaseFolders(apiClient, caseId);

	const bulkFileInfo = folders.flatMap((folder) => {
		let folderPath = folder.path
			.split('/')
			.map((folderName) => camelCaseToWords(folderName.trim()).replace('Lpa', 'LPA'))
			.map((folderName) =>
				folderName.toLowerCase() === APPEAL_CASE_STAGE.INTERNAL
					? 'Case Management (Internal)'
					: folderName
			)
			.join('/');

		return folder.documents
			.map((document) => {
				const { blobStorageContainer, blobStoragePath, documentURI } =
					document.latestDocumentVersion;

				const representationAttachmentFullName =
					representationAttachmentFullNames[document.id || document.guid];

				// If this is in Representation Attachments folder, only include if it's mapped
				if (folderPath === 'Representation/Representation Attachments') {
					if (representationAttachmentFullName) {
						// if only ip comments required, only include ip comments
						if (
							representationType === 'ip-comments' &&
							!representationAttachmentFullName?.includes('Interested party comments')
						) {
							return null;
						}
						return {
							fullName: representationAttachmentFullName,
							blobStorageContainer,
							blobStoragePath,
							documentURI
						};
					} else {
						// Skip unmapped representation attachments
						return null;
					}
				} else {
					// For other folders, include all documents
					return {
						fullName: representationAttachmentFullName || `${folderPath}/${document.name}`,
						blobStorageContainer,
						blobStoragePath,
						documentURI
					};
				}
			})
			.filter(Boolean); // Remove null entries
	});

	return bulkFileInfo.filter((fileInfo) => fileInfo?.blobStoragePath && fileInfo?.documentURI); // don't fail all files if blob path is null (seeded data in development and testing)
};
