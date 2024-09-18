import { hideErrors, showErrors } from './_errors.js';
import { buildStagedFileListItem } from './_html.js';
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

	/** @type {string[]} */
	const allowedMimeTypes = (container.dataset.allowedTypes || '').split(',');

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

	if (!form || !uploadButton || !stagedFilesList || !uploadInput || !fileInputContainer || !submitButton) {
		return;
	}

	/**
	 * State object representing all files which are "staged" in the component
	 * Staged files include all files which have not yet been committed by submitting the check your answers page:
	 * - files the user has added manually (via file select, drag and drop, or any other manual action by the user)
	 * - uncommitted files (automatically populated in component from session data)
	 *
	 * @type {import('@pins/appeals/index.js').StagedFiles}
	 */
	const stagedFiles = {
		files: []
	};

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
	 * @param {import('@pins/appeals/index.js').FileUploadParameters[]} uploadedFilesUploadParameters
	 */
	function updateStagedFilesState (uploadedFilesUploadParameters) {
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
	};

	function populateUncommittedFiles () {
		if (!container.dataset.uncommittedFiles) {
			return;
		}

		const uncommittedFilesData = JSON.parse(container.dataset.uncommittedFiles);

		uncommittedFilesData?.files.forEach((/** @type {import('@pins/appeals/index.js').UncommittedFile} */ uncommittedFile) => stagedFiles.files.push({
			name: uncommittedFile.name,
			guid: uncommittedFile.GUID,
			blobStorageUrl: uncommittedFile.blobStoreUrl,
			mimeType: uncommittedFile.mimeType,
			documentType: uncommittedFile.documentType,
			size: uncommittedFile.size,
			stage: uncommittedFile.stage
		}));

		updateStagedFilesUI(stagedFiles.files);
	}

	function createUploadInfoForStagedDocuments() {
		uploadInfo.documents.length = 0;

		stagedFiles.files.forEach(addUploadInfoForStagedFile);

		updateUploadInfoHiddenField(JSON.stringify(uploadInfo.documents));
	}

	/**
	 * @param {import('@pins/appeals/index.js').StagedFile} stagedFile
	 */
	function addUploadInfoForStagedFile (stagedFile) {
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
	async function onFileSelect (selectEvent) {
		const { target } = selectEvent;

		await addSelectedFiles(target.files);
	};

	/**
	 * @param {FileList|null|undefined} fileList
	 */
	async function addSelectedFiles (fileList) {
		if (!fileList) {
			return;
		}

		const files = Array.from(fileList);

		for (const file of files) {
			const validationError = validateSelectedFile(file);

			if (validationError) {
				const error = {
					message: validationError.message || '',
					name: file.name
				};

				// TODO: handle validation errors
				console.error(error);

				return;
			}
		}

		// upload added files to blob storage
		const fileUploadParameters = await uploadAddedFiles(fileList);

		// TODO: handle any errors returned from upload function

		updateStagedFilesState(fileUploadParameters);
		updateStagedFilesUI(stagedFiles.files);

		// update upload button
	}

	/**
	 * @param {FileList} fileList
	 */
	async function uploadAddedFiles (fileList) {
		// TODO: filter the list to only files which have not yet been uploaded (not clear how to check this until upload implementation is done)

		// upload the files to blob storage
		const fileUploadParameters = Array.from(fileList).map(file => {
			const newVersionOfExistingFile = isNewVersionOfExistingFile();
			const guid = newVersionOfExistingFile
				? container.dataset?.documentId || ''
				: window.crypto.randomUUID();

			return {
				file,
				guid,
				blobStorageUrl: createBlobStorageUrl(
					container.dataset?.caseReference,
					guid,
					newVersionOfExistingFile ? (container.dataset?.documentOriginalFileName || '') : file.name,
					newVersionOfExistingFile ? container.dataset?.documentVersion : undefined
				)
			};
		});

		const failedUploads = await uploadFiles(fileUploadParameters);

		if (failedUploads.length) {
			console.log('failed uploads!');
		}

		return fileUploadParameters;
	};

	function allowSingleFileOnly () {
		return !uploadInput?.getAttributeNames().includes('multiple');
	};

	function isNewVersionOfExistingFile () {
		return !!(container.dataset?.documentId) && !!(container.dataset?.documentVersion);
	}

	function updateUploadControlsVisibility () {
		if (!dropZone) {
			return;
		}

		dropZone.hidden = allowSingleFileOnly() && globalDataTransfer.files.length > 0;
	};

	/**
	 * Update button text and files counter
	 *
	 */
	function updateUploadButton () {
		const filesRowsNumber = globalDataTransfer.files.length;

		if (uploadButton) {
			uploadButton.innerHTML = filesRowsNumber > 0 ? 'Add more files' : 'Choose file';
			uploadButton.blur();
		}

		updateUploadControlsVisibility();
	};

	/**
	 * @param {File} selectedFile
	 * @returns {{message: string} | null}
	 */
	function validateSelectedFile (selectedFile) {
		const allowedMimeTypes = (container.dataset.allowedTypes || '').split(',');
		const filenamesInFolderBase64String = form?.dataset.filenamesInFolder || '';
		const filenamesInFolderString = window.atob(filenamesInFolderBase64String);
		const filenamesInFolderArray =
			(filenamesInFolderString && JSON.parse(filenamesInFolderString)) || null;
		const filenamesInFolder = Array.isArray(filenamesInFolderArray) ? filenamesInFolderArray : [];

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
	};

	/**
	 * @param {import('@pins/appeals/index.js').StagedFile[]} stagedFiles
	 */
	function updateStagedFilesUI (stagedFiles) {
		if (!stagedFilesList) {
			return;
		}

		stagedFilesList.replaceChildren(...stagedFiles.map(stagedFile => buildStagedFileListItem(stagedFile)));

		bindRemoveButtonEvents();
	}

	function bindRemoveButtonEvents () {
		const removeButtons = container.querySelectorAll('.pins-file-upload__remove');

		removeButtons.forEach(element => {
			element.addEventListener('click', (clickEvent) => {
				if (clickEvent.target instanceof HTMLElement) {
					const guid = clickEvent.target?.getAttribute('id')?.split('button-remove-')[1];

					removeFileByGUID(guid);
				}
			});
		});
	}

	/**
	 * @param {string|undefined} guid
	 */
	function removeFileByGUID (guid) {
		if (!guid) {
			return;
		}

		const stagedFile = stagedFiles.files.find(file => file.guid === guid);

		if (stagedFile) {
			deleteFiles([stagedFile.blobStorageUrl]);
		}

		stagedFiles.files = stagedFiles.files.filter(file => file.guid !== guid);

		updateStagedFilesUI(stagedFiles.files);
	}

	/**
	 *	@param {Event} clickEvent
	 */
	async function onSubmit (clickEvent) {
		clickEvent.preventDefault();

		createUploadInfoForStagedDocuments();

		form?.submit();
	};

	function bindEvents () {
		uploadButton?.addEventListener('click', (clickEvent) => {
			clickEvent.preventDefault();
			uploadInput?.click();
		});
		uploadInput?.addEventListener('change', onFileSelect, false);
		submitButton?.addEventListener('click', onSubmit);
	};

	function leavePageWarningEventHandler (/** @type {{ preventDefault: () => any; }} */ event) {
		event.preventDefault();
	};

	function enableLeavePageWarning () {
		window.addEventListener('beforeunload', leavePageWarningEventHandler);
	};

	function disableLeavePageWarning () {
		window.removeEventListener('beforeunload', leavePageWarningEventHandler);
	};

	/**
	 * @param {string|undefined} caseReference
	 * @param {string} fileGUID
	 * @param {string} fileName
	 * @param {string} [latestVersion]
	 * @returns {string}
	 */
	function createBlobStorageUrl (caseReference, fileGUID, fileName, latestVersion) {
		if (!caseReference) return '';

		const latestVersionNumber = latestVersion && parseInt(latestVersion, 10);
		const version = latestVersionNumber ? latestVersionNumber + 1 : 1;

		return `appeal/${caseReference}/${fileGUID}/v${version}/${fileName}`;
	};

	return { bindEvents };
};

export default clientActions;
