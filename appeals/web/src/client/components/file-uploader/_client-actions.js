import { showErrors, hideErrors } from './_errors.js';
import {
	buildStagedFileListItem,
	buildErrorListItem,
	showProgressMessage,
	hideProgressMessage
} from './_html.js';
import serverActions from './_server-actions.js';

const CLASSES = {
	dropZone: 'pins-file-upload__dropzone',
	dropZoneDragOver: 'pins-file-upload__dropzone--dragover',
	dropZoneDisabled: 'dropzone-disabled',
	uploadInfoHiddenField: 'upload-info-hidden-field'
};
const SELECTORS = {
	form: '.pins-file-upload form',
	uploadButton: '.pins-file-upload__button',
	stagedFilesList: '.pins-file-upload__files-rows',
	uploadInput: 'input[name="files"]',
	fileInputContainer: '.pins-file-upload__upload',
	submitButton: '.pins-file-upload__submit',
	removeButton: '.pins-file-upload__remove'
};
const MAX_FILE_SIZE = 26214400; // 25MB

/**
 * Actions on the client for the file upload process
 *
 * @param {HTMLElement} container
 * @returns {*}
 */
const clientActions = (container) => {
	const maximumAllowedFileNameLength = 255;

	/** @type {HTMLFormElement | null} */
	const form = container.querySelector(SELECTORS.form);
	/** @type {HTMLElement | null} */
	const uploadButton = container.querySelector(SELECTORS.uploadButton);
	/** @type {HTMLElement | null} */
	const stagedFilesList = container.querySelector(SELECTORS.stagedFilesList);
	/** @type {HTMLInputElement | null} */
	const uploadInput = container.querySelector(SELECTORS.uploadInput);
	/** @type {HTMLElement | null} */
	const fileInputContainer = container.querySelector(SELECTORS.fileInputContainer);
	/** @type {HTMLElement | null} */
	const submitButton = container.querySelector(SELECTORS.submitButton);

	/** @type {HTMLElement | null} */
	let dropZone;

	const { uploadFiles, deleteFiles, deleteUncommittedFileFromSession } = serverActions(container);

	function setupDropzone() {
		dropZone = document.createElement('div');
		dropZone.className = CLASSES.dropZone;
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
		container.querySelector(`.${CLASSES.dropZone}`)?.classList.add(`${CLASSES.dropZoneDragOver}`);
	}

	/**
	 * @param {*} event
	 */
	function onDropZoneDragLeave(event) {
		event.preventDefault();
		container
			.querySelector(`.${CLASSES.dropZone}`)
			?.classList.remove(`${CLASSES.dropZoneDragOver}`);
	}

	/**
	 * @param {*} event
	 */
	function onDropZoneDrop(event) {
		event.preventDefault();
		container
			.querySelector(`.${CLASSES.dropZone}`)
			?.classList.remove(`${CLASSES.dropZoneDragOver}`);

		/** @type {HTMLInputElement | null} */
		if (uploadInput) {
			uploadInput.files = event.dataTransfer?.files;
		}

		addSelectedFiles(uploadInput?.files);
		updateUploadControlsVisibility();
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

	/**
	 * @typedef {Object} UploadInfo
	 * @property {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem[]} documents
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

	/**
	 * @returns {boolean}
	 */
	function createUploadInfoForStagedDocuments() {
		uploadInfo.documents.length = 0;

		stagedFiles.files.forEach(addUploadInfoForStagedFile);

		updateUploadInfoHiddenField(JSON.stringify(uploadInfo.documents));

		return uploadInfo.documents.length > 0;
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
			stage: stagedFile.stage,
			receivedDate: '',
			redactionStatus: 0
		});
	}

	/**
	 * @param {string} value
	 * */
	function updateUploadInfoHiddenField(value) {
		document
			.querySelectorAll(`.${CLASSES.uploadInfoHiddenField}`)
			.forEach((element) => element.remove());

		const hiddenField = document.createElement('input');

		hiddenField.className = CLASSES.uploadInfoHiddenField;
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

		stagedFiles.errors.length = 0;

		if (allowSingleFileOnly() && (fileList.length > 1 || stagedFiles.files?.length)) {
			await showErrors(
				{
					message: 'FILE_SPECIFIC_ERRORS',
					details: [
						{
							message: 'SINGLE_FILE_ONLY',
							guid: '',
							name: '',
							formId: container.dataset?.formId || ''
						}
					]
				},
				container
			);
			updateStagedFilesUI(stagedFiles);
			return;
		}

		showProgressMessage(container);

		const addedFiles = Array.from(fileList || []).map((file) => ({
			file,
			guid: isNewVersionOfExistingFile()
				? container.dataset?.documentId || ''
				: window.crypto.randomUUID()
		}));

		for (const addedFile of addedFiles) {
			const validationError = validateSelectedFile(addedFile.file);

			if (validationError) {
				stagedFiles.errors.push({
					message: validationError.message || '',
					name: addedFile.file.name,
					guid: addedFile.guid,
					metadata: validationError.metadata,
					formId: container.dataset?.formId || ''
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

	/**
	 * @returns {boolean}
	 */
	function allowSingleFileOnly() {
		return !uploadInput?.getAttributeNames().includes('multiple');
	}

	/**
	 * @returns {boolean}
	 */
	function isNewVersionOfExistingFile() {
		return !!container.dataset?.documentId && !!container.dataset?.documentVersion;
	}

	const updateUploadControlsVisibility = () => {
		const displayStyle = allowSingleFileOnly() && globalDataTransfer.files.length > 0 ? 'none' : '';

		if (fileInputContainer) {
			fileInputContainer.style.display = displayStyle;
		}

		if (dropZone) {
			dropZone.style.display = displayStyle;
		}
	};

	/**
	 * @param {File} selectedFile
	 * @returns {{message: string, metadata?: {fileExtension?: string}} | null}
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
		const originalFileExtension = container.dataset.documentOriginalFileName?.split('.').pop();
		if (originalFileExtension && selectedFile.name.split('.').pop() !== originalFileExtension) {
			return {
				message: 'DIFFERENT_FILE_EXTENSION',
				metadata: { fileExtension: originalFileExtension.toUpperCase() }
			};
		}
		if (!allowedMimeTypes.includes(selectedFile.type)) {
			return {
				message: 'DIFFERENT_FILE_EXTENSION',
				metadata: { fileExtension: container.dataset.formattedAllowedTypes }
			};
		}
		if (selectedFile.size > MAX_FILE_SIZE) {
			return { message: 'SIZE_SINGLE_FILE' };
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
						guid: errorItem.guid,
						metadata: errorItem.metadata,
						formId: container.dataset?.formId || ''
					})),
					...failedUploads
				].flat()
			},
			container
		);
	}

	function bindRemoveButtonEvents() {
		const removeButtons = container.querySelectorAll(SELECTORS.removeButton);

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
				deleteUncommittedFileFromSession(matchingUncommittedFile.GUID);

				await deleteFiles([matchingUncommittedFile.blobStoreUrl]);
			} else {
				await deleteFiles([stagedFile.blobStorageUrl]);
			}
		}

		stagedFiles.files = stagedFiles.files.filter((file) => file.guid !== guid);

		updateStagedFilesUI(stagedFiles);
	}

	/**
	 *	@param {Event} clickEvent
	 */
	async function onSubmit(clickEvent) {
		clickEvent.preventDefault();

		const createdUploadInfoForAtLeastOneDocument = createUploadInfoForStagedDocuments();

		if (createdUploadInfoForAtLeastOneDocument) {
			form?.submit();
		} else {
			showErrors(
				{
					message: 'NO_FILE',
					formId: container.dataset?.formId || '',
					metadata: {
						fileTitle: container.dataset?.documentTitle || 'a file'
					}
				},
				container
			);
		}
	}

	function bindEvents() {
		uploadButton?.addEventListener('click', (clickEvent) => {
			if (uploadInput) {
				uploadInput.value = '';
			}
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
