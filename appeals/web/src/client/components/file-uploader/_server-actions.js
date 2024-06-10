/** @typedef {import('./_html.js').AnError} AnError */
/** @typedef {import('./_html.js').FileWithRowId} FileWithRowId */
/** @typedef {import('@azure/core-auth').AccessToken} AccessToken */
/** @typedef {import('@pins/appeals/index.js').UploadRequest} UploadRequest */
/** @typedef {{folderId: string, documentId: string, caseId: string, blobStorageHost: string, blobStorageContainer: string, useBlobEmulator: string}} UploadForm */

import { BlobServiceClient } from '@azure/storage-blob';
import { BlobStorageClient } from '@pins/blob-storage-client';

/**
 *
 * @param {HTMLElement} uploadForm
 * @returns {*}
 */
const serverActions = (uploadForm) => {
	/** @type {AnError[]} */
	const failedUploads = [];

	const getAccessToken = async () => {
		return fetch('/auth/get-access-token')
			.then((response) => {
				return response.json();
			})
			.then((responseJson) => {
				if ('error' in responseJson) {
					throw new Error(responseJson.error?.message);
				}

				return responseJson;
			});
	};

	/**
	 *
	 * @param {FileWithRowId[]} fileList
	 * @param {UploadRequest} uploadInfo
	 * @returns {Promise<AnError[]>}>}
	 */
	const uploadFiles = async (fileList, uploadInfo) => {
		const { documents } = uploadInfo;

		const accessToken = await getAccessToken();

		const { blobStorageHost, blobStorageContainer, useBlobEmulator } =
			/** type: UploadForm **/ uploadForm.dataset;
		if (blobStorageHost == undefined || blobStorageContainer == undefined) {
			throw new Error('blobStorageHost or blobStorageContainer are undefined.');
		}
		const blobStorageClient =
			useBlobEmulator && !accessToken
				? new BlobStorageClient(new BlobServiceClient(blobStorageHost))
				: BlobStorageClient.fromUrlAndToken(blobStorageHost, accessToken);

		for (const documentUploadInfo of documents) {
			const fileToUpload = [...fileList].find(
				(file) => file.fileRowId === documentUploadInfo.fileRowId
			);
			const { blobStoreUrl } = documentUploadInfo;

			if (fileToUpload && blobStoreUrl) {
				const errorOutcome = await uploadOnBlobStorage(
					fileToUpload,
					blobStoreUrl,
					blobStorageClient,
					blobStorageContainer
				);

				if (errorOutcome) {
					failedUploads.push(errorOutcome);
				}
			} else {
				throw new Error(
					'file not uploaded to blob storage because fileToUpload and/or blobStoreUrl was falsy'
				);
			}
		}

		return failedUploads;
	};

	/**
	 *
	 * @param {FileWithRowId} fileToUpload
	 * @param {string} blobStoreUrl
	 * @param {import('@pins/blob-storage-client').BlobStorageClient} blobStorageClient
	 * @param {string} blobStorageContainer
	 * @returns {Promise<AnError | undefined>}
	 */
	const uploadOnBlobStorage = async (
		fileToUpload,
		blobStoreUrl,
		blobStorageClient,
		blobStorageContainer
	) => {
		let response;

		try {
			await blobStorageClient.uploadFile(
				blobStorageContainer,
				fileToUpload,
				blobStoreUrl,
				fileToUpload.type
			);
		} catch {
			response = {
				message: 'GENERIC_SINGLE_FILE',
				fileRowId: fileToUpload.fileRowId || '',
				name: fileToUpload.name
			};
		}

		return response;
	};

	/**
	 * @param {string[]} blobStorageUrls
	 */
	const deleteFiles = async (blobStorageUrls) => {
		const { blobStorageHost, blobStorageContainer, useBlobEmulator, accessToken } =
			/** type: UploadForm **/ uploadForm.dataset;
		if (blobStorageHost == undefined || blobStorageContainer == undefined) {
			throw new Error('blobStorageHost or blobStorageContainer are undefined.');
		}

		let parsedAccessToken;
		if (accessToken) {
			parsedAccessToken = JSON.parse(accessToken);
		}

		const blobStorageClient =
			useBlobEmulator && !accessToken
				? new BlobStorageClient(new BlobServiceClient(blobStorageHost))
				: BlobStorageClient.fromUrlAndToken(blobStorageHost, parsedAccessToken);

		for (const blobStorageUrl of blobStorageUrls) {
			await blobStorageClient.deleteBlobIfExists(blobStorageContainer, blobStorageUrl);
		}
	};

	return {
		uploadFiles,
		deleteFiles
	};
};

export default serverActions;
