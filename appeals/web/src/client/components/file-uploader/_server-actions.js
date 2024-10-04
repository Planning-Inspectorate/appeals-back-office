/** @typedef {import('#appeals/appeal-documents/appeal-documents.types').FileUploadError} FileUploadError */
/** @typedef {import('./_html.js').FileWithRowId} FileWithRowId */
/** @typedef {import('@azure/core-auth').AccessToken} AccessToken */
/** @typedef {import('#appeals/appeal-documents/appeal-documents.types').UploadRequest} UploadRequest */
/** @typedef {{folderId: string, documentId: string, caseId: string, blobStorageHost: string, blobStorageContainer: string, useBlobEmulator: string}} UploadForm */

import { BlobServiceClient } from '@azure/storage-blob';
import { BlobStorageClient } from '@pins/blob-storage-client';

/**
 *
 * @param {HTMLElement} uploadForm
 * @returns {*}
 */
const serverActions = (uploadForm) => {
	/** @type {FileUploadError[]} */
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
	 * @param {import('#appeals/appeal-documents/appeal-documents.types').FileUploadParameters[]} documents
	 * @returns {Promise<FileUploadError[]>}>}
	 */
	async function uploadFiles(documents) {
		const accessToken = await getAccessToken();

		const { blobStorageHost, blobStorageContainer, useBlobEmulator } = uploadForm.dataset;

		if (blobStorageHost == undefined || blobStorageContainer == undefined) {
			throw new Error('blobStorageHost or blobStorageContainer are undefined');
		}

		const blobStorageClient =
			useBlobEmulator && !accessToken
				? new BlobStorageClient(new BlobServiceClient(blobStorageHost))
				: BlobStorageClient.fromUrlAndToken(blobStorageHost, accessToken);

		for (const document of documents) {
			const { file, blobStorageUrl } = document;

			if (file && blobStorageUrl) {
				const errorOutcome = await uploadOnBlobStorage(
					file,
					document.guid,
					blobStorageUrl,
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
	}

	/**
	 *
	 * @param {FileWithRowId} fileToUpload
	 * @param {string} fileGuid
	 * @param {string} blobStoreUrl
	 * @param {import('@pins/blob-storage-client').BlobStorageClient} blobStorageClient
	 * @param {string} blobStorageContainer
	 * @returns {Promise<FileUploadError | undefined>}
	 */
	const uploadOnBlobStorage = async (
		fileToUpload,
		fileGuid,
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
				guid: fileGuid,
				name: fileToUpload.name
			};
		}

		return response;
	};

	/**
	 * Delete one or more files from blob storage
	 * @param {string[]} blobStorageUrls
	 */
	const deleteFiles = async (blobStorageUrls) => {
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

		for (const blobStorageUrl of blobStorageUrls) {
			await blobStorageClient.deleteBlobIfExists(blobStorageContainer, blobStorageUrl);
		}
	};

	/**
	 * Deletes session upload info for a single uncommitted file (does not remove file from blob storage, only deletes metadata from session)
	 * @param {string} guid
	 */
	const deleteUncommittedFileFromSession = async (guid) => {
		const result = await fetch(`/documents/delete-uncommitted/${guid}`, {
			method: 'DELETE'
		}).then((response) => {
			if (!response.ok) {
				throw new Error(
					`An error occurred when requesting deletion of session data for the uncommitted file ${guid}`
				);
			}
			return response;
		});

		return result;
	};

	return {
		uploadFiles,
		deleteFiles,
		deleteUncommittedFileFromSession
	};
};

export default serverActions;
