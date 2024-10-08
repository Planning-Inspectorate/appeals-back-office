import { BlobStorageClient } from '@pins/blob-storage-client';
import config from './config.js';

const storageClient = BlobStorageClient.fromUrl(config.BO_BLOB_STORAGE_ACCOUNT);

/**
 *
 * @param {string} sourceUrl
 * @param {string} destinationUrl
 */
export const copyBlob = async (sourceUrl, destinationUrl) => {
	const destinationComponents = destinationUrl.split(`/${config.BO_BLOB_CONTAINER}/`);
	if (destinationComponents.length !== 2) {
		throw new Error(`Destination URL format unexpected : ${destinationUrl}`);
	}
	const blobPath = destinationComponents[1];
	const blobClient = storageClient.getBlobClient(config.BO_BLOB_CONTAINER, blobPath);
	if (!blobClient) {
		throw new Error(`Could not get a blob reference to ${blobPath}`);
	}

	await blobClient.syncCopyFromURL(sourceUrl);
};
