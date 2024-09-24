import { BlobServiceClient } from '@azure/storage-blob';
import { BlobStorageClient } from '@pins/blob-storage-client';
import getActiveDirectoryAccessToken from '../../lib/active-directory-token.js';
import config from '@pins/appeals.web/environment/config.js';
import {
	getFileInfo,
	getFileVersionsInfo
} from '#appeals/appeal-documents/appeal.documents.service.js';
import { APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';

// TODO: Clean up code

/** @typedef {import('../auth/auth-session.service').SessionWithAuth} SessionWithAuth */
/** @typedef {import('express').Response} Response */

const validScanResult = APPEAL_VIRUS_CHECK_STATUS.SCANNED;

/**
 * Download one document or redirects to its url if preview is active
 *
 * @param {{apiClient: import('got').Got, params: {caseId: string, guid: string, preview?: string}, session: SessionWithAuth}} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getDocumentDownload = async ({ apiClient, params, session }, response) => {
	const { guid: fileGuid, preview, caseId } = params;

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

	let blobStorageClient = undefined;
	if (config.useBlobEmulator === true) {
		blobStorageClient = new BlobStorageClient(new BlobServiceClient(config.blobEmulatorSasUrl));
	} else {
		const accessToken = await getActiveDirectoryAccessToken(session);
		blobStorageClient = BlobStorageClient.fromUrlAndToken(config.blobStorageUrl, accessToken);
	}

	// Document URIs are persisted with a prepended slash, but this slash is treated as part of the key by blob storage so we need to remove it
	const documentKey = blobStoragePath.startsWith('/') ? blobStoragePath.slice(1) : blobStoragePath;
	const fileName = `${documentKey}`.split(/\/+/).pop();

	const blobProperties = await blobStorageClient.getBlobProperties(
		blobStorageContainer,
		documentKey
	);
	if (!blobProperties) {
		return response.status(404);
	}

	if (preview && blobProperties?.contentType) {
		response.setHeader('content-type', blobProperties.contentType);
	} else {
		response.setHeader('content-disposition', `attachment; filename=${fileName}`);
	}

	const blobStream = await blobStorageClient.downloadStream(blobStorageContainer, documentKey);

	if (!blobStream?.readableStreamBody) {
		throw new Error(`Document ${documentKey} missing stream body`);
	}

	blobStream.readableStreamBody?.pipe(response);

	return response.status(200);
};

/**
 * Download one staged/uncommitted document
 *
 * @param {{ params: { caseReference: string, guid: string, filename: string, version: string | undefined }, session: SessionWithAuth }} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getStagedDocumentDownload = async (
	{ params: { caseReference, guid, filename, version }, session },
	response
) => {
	let blobStorageClient = undefined;
	if (config.useBlobEmulator === true) {
		blobStorageClient = new BlobStorageClient(new BlobServiceClient(config.blobEmulatorSasUrl));
	} else {
		const accessToken = await getActiveDirectoryAccessToken(session);
		blobStorageClient = BlobStorageClient.fromUrlAndToken(config.blobStorageUrl, accessToken);
	}

	const documentKey = `appeal/${caseReference}/${guid}/v${version || 1}/${filename}`;
	const fileName = `${documentKey}`.split(/\/+/).pop();

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
		response.setHeader('content-disposition', `attachment; filename=${fileName}`);
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
 * Download one document or redirects to its url if preview is active
 *
 * @param {{apiClient: import('got').Got, params: {caseId: string, guid: string, preview?: string, version: string}, session: SessionWithAuth}} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getDocumentDownloadByVersion = async ({ apiClient, params, session }, response) => {
	const { guid: fileGuid, preview, caseId, version } = params;

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

	let blobStorageClient = undefined;
	if (config.useBlobEmulator === true) {
		blobStorageClient = new BlobStorageClient(new BlobServiceClient(config.blobEmulatorSasUrl));
	} else {
		const accessToken = await getActiveDirectoryAccessToken(session);
		blobStorageClient = BlobStorageClient.fromUrlAndToken(config.blobStorageUrl, accessToken);
	}

	// Document URIs are persisted with a prepended slash, but this slash is treated as part of the key by blob storage so we need to remove it
	const documentKey = blobStoragePath.startsWith('/') ? blobStoragePath.slice(1) : blobStoragePath;
	const fileName = `${documentKey}`.split(/\/+/).pop();

	const blobProperties = await blobStorageClient.getBlobProperties(
		blobStorageContainer,
		documentKey
	);
	if (!blobProperties) {
		return response.status(404);
	}

	if (preview && blobProperties?.contentType) {
		response.setHeader('content-type', blobProperties.contentType);
	} else {
		response.setHeader('content-disposition', `attachment; filename=${fileName}`);
	}

	const blobStream = await blobStorageClient.downloadStream(blobStorageContainer, documentKey);

	if (!blobStream?.readableStreamBody) {
		throw new Error(`Document ${documentKey} missing stream body`);
	}

	blobStream.readableStreamBody?.pipe(response);

	return response.status(200);
};
