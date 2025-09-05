import config from '#config/config.js';
import { BlobServiceClient } from '@azure/storage-blob';
import { VALID_MIME_TYPES } from '@pins/appeals/constants/documents.js';
import { BlobStorageClient } from '@pins/blob-storage-client';

/**
 * @param {string} appealReference
 * @param {string[]} storagePaths
 * @returns {Promise<boolean>}
 */
export const validateBlobContents = async (appealReference, storagePaths) => {
	const storageClient = config.useBlobEmulator
		? new BlobStorageClient(new BlobServiceClient(config.blobEmulatorSasUrl))
		: BlobStorageClient.fromUrl(config.BO_BLOB_STORAGE_ACCOUNT);

	for (const path of storagePaths) {
		if (!validateBlobPath(appealReference, path)) {
			return false;
		}

		const blobClient = storageClient.getBlobClient(config.BO_BLOB_CONTAINER, path);
		if (!blobClient) {
			return false;
		}

		const blobProperties = await blobClient.getProperties();
		const mime = blobProperties.contentType || '';
		const header = await blobClient.downloadToBuffer(0, 8);
		const uint8Array = new Uint8Array(header);
		const isValidSignature = validateMimeType(uint8Array, mime);

		return isValidSignature;
	}

	return true;
};

/**
 *
 * @param {Uint8Array} uint8Array
 * @param {string} mime
 * @returns {boolean}
 */
const validateMimeType = (uint8Array, mime) => {
	let bytes = [];
	for (let i = 0; i < 8; i++) {
		bytes.push(uint8Array[i].toString(16).padStart(2, '0'));
	}

	const result = bytes.join('').toUpperCase();
	const match = VALID_MIME_TYPES[mime];
	if (match) {
		const offset = match.offset ?? 0;
		return match.hexSignature
			.split(',')
			.some((/** @type {string} */ magicNumber) =>
				result.substring(offset).startsWith(magicNumber.trim())
			);
	}

	return false;
};

/**
 *
 * @param {string} appealReference
 * @param {string} path
 * @returns {boolean}
 */
const validateBlobPath = (appealReference, path) => path.startsWith(`appeal/${appealReference}/`);
