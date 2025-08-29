import config from '#config/config.js';
import { BlobStorageClient } from '@pins/blob-storage-client';
import { BlobServiceClient } from '@azure/storage-blob';
import logger from '#utils/logger.js';

/**
 * Copies blobs from one location to another
 * @param {{ sourceBlobName: string|null|undefined, destinationBlobName: string }[]} copyList
 * @returns {Promise<Promise<Awaited<unknown>[]> | Promise<{[p: string]: Awaited<*>, [p: number]: Awaited<*>, [p: symbol]: Awaited<*>}>>}
 */
export const copyBlobs = async (copyList) => {
	const storageContainer = config.BO_BLOB_CONTAINER;
	const storageClient = config.useBlobEmulator
		? new BlobStorageClient(new BlobServiceClient(config.blobEmulatorSasUrl))
		: BlobStorageClient.fromUrl(config.BO_BLOB_STORAGE_ACCOUNT);

	return Promise.all(
		// @ts-ignore
		copyList.map(async (copyDetails) => {
			const { sourceBlobName, destinationBlobName } = copyDetails;
			let copyResult;
			try {
				copyResult = await storageClient.copyFile({
					sourceContainerName: storageContainer,
					destinationContainerName: storageContainer,
					sourceBlobName: sourceBlobName ?? '',
					destinationBlobName
				});
			} catch (error) {
				logger.error(`Error copying blob ${sourceBlobName} to ${destinationBlobName}: ${error}`);
			}
			return copyResult;
		})
	);
};
