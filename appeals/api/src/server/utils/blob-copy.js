import config from '#config/config.js';
import { eventClient } from '#infrastructure/event-client.js';
import { producers } from '#infrastructure/topics.js';
import logger from '#utils/logger.js';
import { BlobServiceClient } from '@azure/storage-blob';
import { BlobStorageClient } from '@pins/blob-storage-client';
import { EventType } from '@pins/event-client';

/**
 * Copies blobs from one location to another
 * @param {{ sourceBlobName: string|null|undefined, destinationBlobName: string }[]} copyList
 * @returns {Promise<Promise<Awaited<unknown>[]> | Promise<{[p: string]: Awaited<*>, [p: number]: Awaited<*>, [p: symbol]: Awaited<*>}>>}
 */
export const copyBlobs = async (copyList) => {
	if (config.useBlobEmulator) {
		await copyBlobsUsingEmulator(copyList);
	}

	return copyBlobsUsingAzure(copyList);
};

/**
 * Copies blobs from one location to another using Azure event client
 * @param {{sourceBlobName:  string | null | undefined, destinationBlobName: string}[]} copyList
 * @returns {Promise<Promise<Awaited<unknown>[]> | Promise<{[p: string]: Awaited<*>, [p: number]: Awaited<*>, [p: symbol]: Awaited<*>}>>}
 */
const copyBlobsUsingAzure = async (copyList) => {
	const messages = copyList
		.map((copyDetails) => {
			const { sourceBlobName, destinationBlobName } = copyDetails;
			if (!sourceBlobName || !destinationBlobName) {
				return null;
			}
			const container = `${config.BO_BLOB_STORAGE_ACCOUNT}${config.BO_BLOB_CONTAINER}`;
			return {
				originalURI: `${container}/${sourceBlobName}`,
				importedURI: `${container}/${destinationBlobName}`
			};
		})
		.filter((message) => message !== null);
	if (messages.length > 0) {
		const topic = producers.boBlobMove;
		const res = await eventClient.sendEvents(topic, messages, EventType.Create);
		if (res) {
			return Promise.resolve(res);
		}
	}
	return Promise.resolve([]);
};

/**
 * Copies blobs from one location to another within the blob emulator
 * @param {{sourceBlobName:  string | null | undefined, destinationBlobName: string}[]} copyList
 * @returns {Promise<Promise<Awaited<unknown>[]> | Promise<{[p: string]: Awaited<*>, [p: number]: Awaited<*>, [p: symbol]: Awaited<*>}>>}
 */
const copyBlobsUsingEmulator = async (copyList) => {
	const storageContainer = config.BO_BLOB_CONTAINER;
	const storageClient = new BlobStorageClient(new BlobServiceClient(config.blobEmulatorSasUrl));
	return Promise.allSettled(
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
