import { generateAllPdfs } from '#app/components/download-all-generated-pdfs.component.js';
import {
	getAllCaseFolders,
	getFileInfo,
	getFileVersionsInfo
} from '#appeals/appeal-documents/appeal.documents.service.js';
import { BlobServiceClient } from '@azure/storage-blob';
import config from '@pins/appeals.web/environment/config.js';
import { BlobStorageClient } from '@pins/blob-storage-client';
import { APPEAL_CASE_STAGE, APPEAL_VIRUS_CHECK_STATUS } from '@planning-inspectorate/data-model';
import archiver from 'archiver';
import getActiveDirectoryAccessToken from '../../lib/active-directory-token.js';

/** @typedef {import('../auth/auth-session.service').SessionWithAuth} SessionWithAuth */
/** @typedef {import('#appeals/appeal-details/appeal-details.types.d.ts').WebAppeal} WebAppeal */
/** @typedef {import('express').Response} Response */

const validScanResult = APPEAL_VIRUS_CHECK_STATUS.SCANNED;

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
	const { guid: fileGuid, filename: requestedFilename, caseId } = params;

	const fileInfo = await getFileInfo(apiClient, caseId.toString(), fileGuid);

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
	const { guid: fileGuid, filename: requestedFilename, caseId, version } = params;

	const filesInfo = await getFileVersionsInfo(apiClient, caseId.toString(), fileGuid);

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
	} catch {
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
 * Build a zipped file and Download
 *
 * @param {{apiClient: import('got').Got, params: {caseId: string, filename?: string}, session: SessionWithAuth, currentAppeal: WebAppeal}} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getBulkDocumentDownload = async (
	{ apiClient, params, session, currentAppeal },
	response
) => {
	const { filename: requestedFilename, caseId } = params;

	const folders = await getAllCaseFolders(apiClient, caseId);
	const bulkFileInfo = folders
		?.filter((folder) => folder.documents.length)
		.filter((folder) => !folder.path.startsWith(APPEAL_CASE_STAGE.INTERNAL))
		.flatMap((folder) => {
			return folder.documents.map((document) => {
				const { blobStorageContainer, blobStoragePath, documentURI } =
					document.latestDocumentVersion;
				return {
					fullName: `${folder.path}/${document.name}`,
					blobStorageContainer,
					blobStoragePath,
					documentURI
				};
			});
		});

	const timestampTokens = new Date().toISOString().split('T');
	const dateString = timestampTokens[0].replaceAll('-', '');
	const timeString = timestampTokens[1].split('.')[0].replaceAll(':', '');
	const zipFileName = requestedFilename?.replace('.zip', `_${dateString}${timeString}.zip`);

	response.setHeader('content-type', 'application/zip');
	response.setHeader('content-disposition', `attachment; filename=${zipFileName}`);

	const archive = archiver('zip', {
		zlib: { level: 9 } // Sets the compression level.
	});

	archive.pipe(response);

	const /** @type {string[]} */ missingFiles = [];

	if (!bulkFileInfo?.length) {
		missingFiles.push('No documents found in this case');
	} else {
		const blobStorageClient = await createBlobStorageClient(session);
		const blobStreams = await Promise.all(
			bulkFileInfo.map((fileInfo) =>
				createBlobDownloadStream(
					blobStorageClient,
					fileInfo.blobStorageContainer,
					fileInfo.blobStoragePath
				)
			)
		);

		blobStreams.forEach((blobStream, index) => {
			if (blobStream && blobStream !== null) {
				archive.append(blobStream, { name: bulkFileInfo[index].fullName });
			} else {
				missingFiles.push(bulkFileInfo[index].fullName);
			}
		});
	}

	if (config.featureFlags.featureFlagPdfDownload) {
		const successfulPdfs = await generateAllPdfs(currentAppeal, apiClient);

		// @ts-ignore
		successfulPdfs.forEach((pdf) => archive.append(pdf.buffer, { name: pdf.name }));
	}

	if (missingFiles.length) {
		archive.append(Buffer.from(JSON.stringify(missingFiles)), { name: 'missing-files.json' });
	}

	await archive.finalize();
	return response.status(200);
};
