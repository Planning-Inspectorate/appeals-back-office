import { showErrors, hideErrors } from './_errors.js';
import {
	buildStagedFileListItem,
	buildErrorListItem,
	showProgressMessage,
	hideProgressMessage
} from './_html.js';
import serverActions from './_server-actions.js';

const CLASSES = {
	dropZoneDisabled: 'dropzone-disabled'
};

/**
 * Actions on the client for the file upload process
 *
 * @param {HTMLElement} container
 * @returns {*}
 */
const clientActions = (container) => {
	const maximumAllowedFileNameLength = 255;

	/** @type {HTMLFormElement | null} */
	const form = container.querySelector('.pins-file-upload form');
	/** @type {HTMLElement | null} */
	const uploadButton = container.querySelector('.pins-file-upload__button');
	/** @type {HTMLElement | null} */
	const stagedFilesList = container.querySelector('.pins-file-upload__files-rows');
	/** @type {HTMLInputElement | null} */
	const uploadInput = container.querySelector('input[name="files"]');
	/** @type {HTMLElement | null} */
	const fileInputContainer = container.querySelector('.pins-file-upload__upload');
	/** @type {HTMLElement | null} */
	const submitButton = container.querySelector('.pins-file-upload__submit');

	/** @type {HTMLElement | null} */
	let dropZone;

	const { uploadFiles, deleteFiles } = serverActions(container);

	function setupDropzone() {
		if (allowSingleFileOnly() || isNewVersionOfExistingFile()) {
			fileInputContainer?.classList.add(CLASSES.dropZoneDisabled);
			return;
		}

		dropZone = document.createElement('div');
		dropZone.className = 'pins-file-upload__dropzone';
		fileInputContainer?.parentNode?.insertBefore(dropZone, fileInputContainer);

		if (fileInputContainer) {
			dropZone.appendChild(fileInputContainer);
		}

		dropZone.addEventListener('dragover', onDropZoneDragOver);
		dropZone.addEventListener('dragleave', onDropZoneDragLeave);
		dropZone.addEventListener('drop', onDropZoneDrop);
	}

	/**
	 * @param {*} event
	 */
	function onDropZoneDragOver(event) {
		event.preventDefault();
		container
			.querySelector('.pins-file-upload__dropzone')
			?.classList.add('pins-file-upload__dropzone--dragover');
	}

	/**
	 * @param {*} event
	 */
	function onDropZoneDragLeave(event) {
		event.preventDefault();
		container
			.querySelector('.pins-file-upload__dropzone')
			?.classList.remove('pins-file-upload__dropzone--dragover');
	}

	/**
	 * @param {*} event
	 */
	function onDropZoneDrop(event) {
		event.preventDefault();
		container
			.querySelector('.pins-file-upload__dropzone')
			?.classList.remove('pins-file-upload__dropzone--dragover');

		/** @type {HTMLInputElement | null} */
		if (uploadInput) {
			uploadInput.files = event.dataTransfer?.files;
		}

		addSelectedFiles(uploadInput?.files);
		updateUploadButton();
	}

	if (
		!form ||
		!uploadButton ||
		!stagedFilesList ||
		!uploadInput ||
		!fileInputContainer ||
		!submitButton
	) {
		return;
	}

	/**
	 * State object representing all files which are "staged" in the component
	 * Staged files include all files which have not yet been committed by submitting the check your answers page:
	 * - files the user has added manually (via file select, drag and drop, or any other manual action by the user)
	 * - uncommitted files (automatically populated in component from session data)
	 *
	 * @type {import('#appeals/appeal-documents/appeal-documents.types').StagedFiles}
	 */
	const stagedFiles = {
		files: [],
		errors: []
	};

	/**
	 * @type {import('#appeals/appeal-documents/appeal-documents.types').UncommittedFiles}
	 */
	const uncommittedFiles = {
		files: []
	};

	/** @type {import('#appeals/appeal-documents/appeal-documents.types').RemovedUncommittedFile[]} */
	const removedUncommittedFiles = [];

	/**
	 * @typedef {Object} UploadInfo
	 * @property {any[]} documents
	 * @property {import('./_server-actions.js').AccessToken} [accessToken]
	 */

	/** @type {UploadInfo} */
	const uploadInfo = {
		documents: [],
		...(container.dataset?.accessToken && {
			accessToken: JSON.parse(container.dataset?.accessToken || '')
		})
	};

	let globalDataTransfer = new DataTransfer();

	setupDropzone();
	populateUncommittedFiles();

	/**
	 *
	 * @param {import('#appeals/appeal-documents/appeal-documents.types').FileUploadParameters[]} uploadedFilesUploadParameters
	 */
	function updateStagedFilesState(uploadedFilesUploadParameters) {
		for (const uploadedFile of uploadedFilesUploadParameters) {
			stagedFiles.files.push({
				name: uploadedFile.file.name,
				guid: uploadedFile.guid,
				blobStorageUrl: uploadedFile.blobStorageUrl,
				mimeType: uploadedFile.file.type,
				documentType: container.dataset?.documentType || '',
				size: uploadedFile.file.size,
				stage: container.dataset?.documentStage || ''
			});
		}
	}

	function populateUncommittedFiles() {
		if (!container.dataset.uncommittedFiles) {
			return;
		}

		const uncommittedFilesData = JSON.parse(container.dataset.uncommittedFiles);

		uncommittedFiles.files = uncommittedFilesData.files;
		uncommittedFiles?.files.forEach(
			(
				/** @type {import('#appeals/appeal-documents/appeal-documents.types').UncommittedFile} */ uncommittedFile
			) =>
				stagedFiles.files.push({
					name: uncommittedFile.name,
					guid: uncommittedFile.GUID,
					blobStorageUrl: uncommittedFile.blobStoreUrl,
					mimeType: uncommittedFile.mimeType,
					documentType: uncommittedFile.documentType,
					size: uncommittedFile.size,
					stage: uncommittedFile.stage
				})
		);

		updateStagedFilesUI(stagedFiles);
	}

	function createUploadInfoForStagedDocuments() {
		uploadInfo.documents.length = 0;

		stagedFiles.files.forEach(addUploadInfoForStagedFile);

		updateUploadInfoHiddenField(JSON.stringify(uploadInfo.documents));
	}

	/**
	 * @param {import('#appeals/appeal-documents/appeal-documents.types').StagedFile} stagedFile
	 */
	function addUploadInfoForStagedFile(stagedFile) {
		uploadInfo.documents.push({
			name: stagedFile.name,
			GUID: stagedFile.guid,
			blobStoreUrl: stagedFile.blobStorageUrl,
			mimeType: stagedFile.mimeType,
			documentType: stagedFile.documentType,
			size: stagedFile.size,
			stage: stagedFile.stage
		});
	}

	/**
	 * @param {any} value
	 * */
	function updateUploadInfoHiddenField(value) {
		document.querySelectorAll('.upload-info-hidden-field').forEach((element) => element.remove());

		const hiddenField = document.createElement('input');

		hiddenField.className = 'upload-info-hidden-field';
		hiddenField.type = 'hidden';
		hiddenField.name = 'upload-info';
		hiddenField.value = value;

		form?.append(hiddenField);
	}

	/**
	 * @param {*} selectEvent
	 */
	async function onFileSelect(selectEvent) {
		const { target } = selectEvent;

		await addSelectedFiles(target.files);
	}

	/**
	 * @param {FileList|null|undefined} fileList
	 */
	async function addSelectedFiles(fileList) {
		if (!fileList) {
			return;
		}

		showProgressMessage(container);

		const addedFiles = Array.from(fileList).map((file) => ({
			file,
			guid: isNewVersionOfExistingFile()
				? container.dataset?.documentId || ''
				: window.crypto.randomUUID()
		}));

		stagedFiles.errors.length = 0;

		for (const addedFile of addedFiles) {
			const validationError = validateSelectedFile(addedFile.file);

			if (validationError) {
				stagedFiles.errors.push({
					message: validationError.message || '',
					name: addedFile.file.name,
					guid: addedFile.guid
				});
			}
		}

		const uploadResult = await uploadAddedFiles(addedFiles);

		updateStagedFilesState(uploadResult.fileUploadParameters);
		updateStagedFilesUI(stagedFiles);
		updateErrorsUI(stagedFiles, uploadResult.failedUploads);
		hideProgressMessage(container);
	}

	/**
	 * @param {{file: File, guid: string}[]} addedFiles
	 * @returns {Promise<import('#appeals/appeal-documents/appeal-documents.types').UploadFilesResult>}
	 */
	async function uploadAddedFiles(addedFiles) {
		const fileUploadParameters = addedFiles
			.filter(
				(addedFile) =>
					!stagedFiles.errors.find((errorItem) => errorItem.name === addedFile.file.name)
			)
			.map((addedFile) => {
				const newVersionOfExistingFile = isNewVersionOfExistingFile();

				return {
					file: addedFile.file,
					guid: addedFile.guid,
					blobStorageUrl: createBlobStorageUrl(
						container.dataset?.caseReference,
						addedFile.guid,
						newVersionOfExistingFile
							? container.dataset?.documentOriginalFileName || ''
							: addedFile.file.name,
						newVersionOfExistingFile ? container.dataset?.documentVersion : undefined
					)
				};
			});

		/** @type {import('#appeals/appeal-documents/appeal-documents.types').FileUploadError[]} */
		const failedUploads = await uploadFiles(fileUploadParameters);

		return {
			fileUploadParameters,
			failedUploads
		};
	}

	function allowSingleFileOnly() {
		return !uploadInput?.getAttributeNames().includes('multiple');
	}

	function isNewVersionOfExistingFile() {
		return !!container.dataset?.documentId && !!container.dataset?.documentVersion;
	}

	function updateUploadControlsVisibility() {
		if (!dropZone) {
			return;
		}

		dropZone.hidden = allowSingleFileOnly() && globalDataTransfer.files.length > 0;
	}

	/**
	 * Update button text and files counter
	 *
	 */
	function updateUploadButton() {
		const filesRowsNumber = globalDataTransfer.files.length;

		if (uploadButton) {
			uploadButton.innerHTML = filesRowsNumber > 0 ? 'Add more files' : 'Choose file';
			uploadButton.blur();
		}

		updateUploadControlsVisibility();
	}

	/**
	 * @param {File} selectedFile
	 * @returns {{message: string} | null}
	 */
	function validateSelectedFile(selectedFile) {
		const allowedMimeTypes = (container.dataset.allowedTypes || '').split(',');
		const filenamesInFolderBase64String = form?.dataset.filenamesInFolder || '';
		const filenamesInFolderString = window.atob(filenamesInFolderBase64String);
		const filenamesInFolderArray =
			(filenamesInFolderString && JSON.parse(filenamesInFolderString)) || null;
		const filenamesInFolder = Array.isArray(filenamesInFolderArray) ? filenamesInFolderArray : [];
		const filenamesInStagedFiles = stagedFiles.files.map((stagedFile) => stagedFile.name);

		if (filenamesInStagedFiles.includes(selectedFile.name)) {
			return { message: 'DUPLICATE_NAME_SINGLE_FILE' };
		}
		if (filenamesInFolder.includes(selectedFile.name)) {
			return { message: 'DUPLICATE_NAME_SINGLE_FILE' };
		}
		if (selectedFile.name.length > maximumAllowedFileNameLength) {
			return { message: 'NAME_SINGLE_FILE' };
		}
		if (!allowedMimeTypes.includes(selectedFile.type)) {
			return { message: 'TYPE_SINGLE_FILE' };
		}

		return null;
	}

	/**
	 * @param {import('#appeals/appeal-documents/appeal-documents.types').StagedFiles} stagedFiles
	 */
	function updateStagedFilesUI(stagedFiles) {
		if (!stagedFilesList) {
			return;
		}

		stagedFilesList.replaceChildren(
			...stagedFiles.errors.map((stagedFileError) => buildErrorListItem(stagedFileError)),
			...stagedFiles.files.map((stagedFile) => buildStagedFileListItem(stagedFile))
		);

		bindRemoveButtonEvents();
	}

	/**
	 * @param {import('#appeals/appeal-documents/appeal-documents.types').StagedFiles} stagedFiles
	 * @param {import('#appeals/appeal-documents/appeal-documents.types').FileUploadError[]} failedUploads
	 */
	function updateErrorsUI(stagedFiles, failedUploads) {
		hideErrors(container);

		if (stagedFiles.errors.length === 0 && failedUploads.length === 0) {
			return;
		}

		showErrors(
			{
				message: 'FILE_SPECIFIC_ERRORS',
				details: [
					...stagedFiles.errors.map((errorItem) => ({
						message: errorItem.message,
						name: errorItem.name,
						guid: errorItem.guid
					})),
					...failedUploads
				].flat()
			},
			container
		);
	}

	function bindRemoveButtonEvents() {
		const removeButtons = container.querySelectorAll('.pins-file-upload__remove');

		removeButtons.forEach((element) => {
			element.addEventListener('click', async (clickEvent) => {
				if (clickEvent.target instanceof HTMLElement) {
					const guid = clickEvent.target?.getAttribute('id')?.split('button-remove-')[1];

					await removeFileByGUID(guid);
				}
			});
		});
	}

	/**
	 * @param {string|undefined} guid
	 */
	async function removeFileByGUID(guid) {
		if (!guid) {
			return;
		}

		const stagedFile = stagedFiles.files.find((file) => file.guid === guid);

		if (stagedFile) {
			const matchingUncommittedFile = uncommittedFiles.files.find(
				(uncommittedFile) => uncommittedFile.GUID === guid
			);

			if (matchingUncommittedFile) {
				removedUncommittedFiles.push({
					guid: matchingUncommittedFile.GUID,
					blobStorageUrl: matchingUncommittedFile.blobStoreUrl
				});
			} else {
				await deleteFiles([stagedFile.blobStorageUrl]);
			}
		}

		stagedFiles.files = stagedFiles.files.filter((file) => file.guid !== guid);

		updateStagedFilesUI(stagedFiles);
	}

	async function deleteRemovedUncommittedFiles() {
		await deleteFiles(
			removedUncommittedFiles.map((removedUncommittedFile) => removedUncommittedFile.blobStorageUrl)
		);
	}

	/**
	 *	@param {Event} clickEvent
	 */
	async function onSubmit(clickEvent) {
		clickEvent.preventDefault();

		await deleteRemovedUncommittedFiles();
		createUploadInfoForStagedDocuments();

		form?.submit();
	}

	function bindEvents() {
		uploadButton?.addEventListener('click', (clickEvent) => {
			clickEvent.preventDefault();
			uploadInput?.click();
		});
		uploadInput?.addEventListener('change', onFileSelect, false);
		submitButton?.addEventListener('click', onSubmit);
	}

	/**
	 * @param {string|undefined} caseReference
	 * @param {string} fileGUID
	 * @param {string} fileName
	 * @param {string} [latestVersion]
	 * @returns {string}
	 */
	function createBlobStorageUrl(caseReference, fileGUID, fileName, latestVersion) {
		if (!caseReference) return '';

		const latestVersionNumber = latestVersion && parseInt(latestVersion, 10);
		const version = latestVersionNumber ? latestVersionNumber + 1 : 1;

		return `appeal/${caseReference}/${fileGUID}/v${version}/${fileName}`;
	}

	return { bindEvents };
};

export default clientActions;
