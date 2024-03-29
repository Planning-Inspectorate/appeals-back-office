import { hideErrors, showErrors } from './_errors.js';
import serverActions from './_server-actions.js';
import { buildErrorListItem, buildProgressMessage, buildRegularListItem } from './_html.js';

/** @typedef {import('./_html.js').AnError} AnError */
/** @typedef {import('./_html.js').FileWithRowId} FileWithRowId */

/**
 * Actions on the client for the file upload process
 *
 * @param {HTMLElement} uploadForm
 * @returns {*}
 */
const clientActions = (uploadForm) => {
	/** @type {HTMLElement | null} */
	const uploadButton = uploadForm.querySelector('.pins-file-upload__button');
	/** @type {HTMLElement | null} */
	const uploadCounter = uploadForm.querySelector('.pins-file-upload__counter');
	/** @type {HTMLElement | null} */
	const filesRows = uploadForm.querySelector('.pins-file-upload__files-rows');
	/** @type {HTMLElement | null} */
	const uploadInput = uploadForm.querySelector('input[name="files"]');
	/** @type {HTMLElement | null} */
	const submitButton = uploadForm.querySelector('.pins-file-upload__submit');
	/** @type {HTMLElement | null} */
	const uploadRow = uploadForm.querySelector('.pins-file-upload__upload');
	/** @type {HTMLElement | null} */
	let dropZone;

	function setupDropzone() {
		dropZone = document.createElement('div');
		dropZone.className = 'pins-file-upload__dropzone';
		uploadRow?.parentNode?.insertBefore(dropZone, uploadRow);

		if (uploadRow) {
			dropZone.appendChild(uploadRow);
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
		console.log('onDropZoneDragOver - event:');
		console.log(event);
		uploadForm
			.querySelector('.pins-file-upload__dropzone')
			?.classList.add('pins-file-upload__dropzone--dragover');
	}

	/**
	 * @param {*} event
	 */
	function onDropZoneDragLeave(event) {
		event.preventDefault();
		console.log('onDropZoneDragLeave - event:');
		console.log(event);
		uploadForm
			.querySelector('.pins-file-upload__dropzone')
			?.classList.remove('pins-file-upload__dropzone--dragover');
	}

	/**
	 * @param {*} event
	 */
	function onDropZoneDrop(event) {
		event.preventDefault();
		console.log('onDropZoneDrop - event:');
		console.log(event);
		uploadForm
			.querySelector('.pins-file-upload__dropzone')
			?.classList.remove('pins-file-upload__dropzone--dragover');

		/** @type {HTMLInputElement | null} */
		const fileInput = uploadForm.querySelector('input[type="file"]');
		if (fileInput) {
			fileInput.files = event.dataTransfer?.files;
		}

		updateFilesRows(fileInput);
		updateButtonText();
	}

	setupDropzone();

	if (!uploadButton || !uploadInput || !filesRows || !uploadCounter || !submitButton) return;

	let globalDataTransfer = new DataTransfer();

	/**
	 * Execute actions after selecting the files to upload
	 *
	 * @param {*} selectEvent
	 */
	const onFileSelect = (selectEvent) => {
		const { target } = selectEvent;

		updateFilesRows(target);
		updateButtonText();
	};

	/**
	 * Update button text and files counter
	 *
	 */
	const updateButtonText = () => {
		const filesRowsNumber = globalDataTransfer.files.length;

		uploadButton.innerHTML = filesRowsNumber > 0 ? 'Add more files' : 'Choose file';
		uploadButton.blur();
		uploadCounter.textContent = filesRowsNumber > 0 ? `${filesRowsNumber} files` : 'No file chosen';
	};

	/**
	 * @param {FileWithRowId} selectedFile
	 * @returns {{message: string} | null}
	 */
	const checkSelectedFile = (selectedFile) => {
		const allowedMimeTypes = (uploadForm.dataset.allowedTypes || '').split(',');

		if (selectedFile.name.length > 255) {
			return { message: 'NAME_SINGLE_FILE' };
		}
		if (!allowedMimeTypes.includes(selectedFile.type)) {
			return { message: 'TYPE_SINGLE_FILE' };
		}
		return null;
	};

	/**
	 *	Add rows in the files list
	 *
	 * @param {*} target
	 */
	const updateFilesRows = (target) => {
		const { files: newFiles } = target;

		hideErrors(uploadForm);

		const wrongFiles = [];

		for (const selectedFile of newFiles) {
			const fileRowId = `file_row_${selectedFile.lastModified}_${selectedFile.size}`;
			const fileCannotBeAdded = checkSelectedFile(selectedFile);
			const fileRow = uploadForm.querySelector(`#${fileRowId}`);

			if (fileCannotBeAdded) {
				const error = {
					message: fileCannotBeAdded.message || '',
					name: selectedFile.name,
					fileRowId
				};

				filesRows.innerHTML += buildErrorListItem(error);
				wrongFiles.push(error);
			} else if (!fileRow) {
				selectedFile.fileRowId = fileRowId;
				globalDataTransfer.items.add(selectedFile);
				filesRows.append(buildRegularListItem(selectedFile));

				const removeButton = [...filesRows.querySelectorAll(`.pins-file-upload__remove`)].pop();

				if (removeButton) {
					removeButton.addEventListener('click', removeFileRow);
				}
			}
		}
		if (wrongFiles.length > 0) {
			showErrors({ message: 'FILE_SPECIFIC_ERRORS', details: wrongFiles }, uploadForm);
		}
		// reset the INPUT value to be able to re-uploade deleted files
		target.value = '';
	};

	/**
	 * Remove one specific row from the files list
	 *
	 * @param {*} clickEvent
	 */
	const removeFileRow = (clickEvent) => {
		/** @type {FileWithRowId[]} */
		const filesWithIds = [...globalDataTransfer.files];
		const rowToRemove = clickEvent.target?.parentElement;
		const fileToRemove = filesWithIds.find((file) => file.fileRowId === rowToRemove?.id);

		if (rowToRemove && fileToRemove) {
			const rowToRemoveIndex = filesWithIds.indexOf(fileToRemove);

			globalDataTransfer.items.remove(rowToRemoveIndex);
			rowToRemove.remove();
			updateButtonText();
		}
	};

	const onSubmitValidation = async () => {
		/** @type {HTMLInputElement|null} */
		const additionalDocumentsConfirmation = document.querySelector(
			'#additionalDocumentsConfirmation'
		);

		if (additionalDocumentsConfirmation && !additionalDocumentsConfirmation?.checked) {
			// eslint-disable-next-line no-throw-literal
			throw { message: 'ADDITIONAL_DOCUMENTS_CONFIRMATION_REQUIRED' };
		}

		const filesToUpload = globalDataTransfer.files;

		return new Promise((resolve, reject) => {
			const filesSize = [...filesToUpload].reduce((total, file) => total + file.size, 0);
			const filesNumber = filesToUpload.length;

			if (filesNumber === 0) {
				reject(new Error('NO_FILE'));
			}

			// i.e. 1GB in bytes
			if (filesSize > 1_073_741_824) {
				const sizeInGb = `${Math.round(filesSize * 1e-8) / 10} GB`;

				// eslint-disable-next-line no-throw-literal
				throw { message: 'SIZE_EXCEEDED', details: [{ message: sizeInGb }] };
			}
			resolve(filesToUpload);
		});
	};

	/**
	 *
	 * @param {AnError[]} errors
	 */
	const finalizeUpload = (errors) => {
		globalDataTransfer = new DataTransfer();
		updateButtonText();

		if (errors.length > 0) {
			const failedRowIds = new Set(errors.map((error) => error.fileRowId));
			const allRowsId = [...filesRows.children].map((row) => row.id);

			for (const rowId of allRowsId) {
				const fileRow = uploadForm.querySelector(`#${rowId}`);

				if (!failedRowIds.has(rowId) && fileRow) {
					fileRow.remove();
				}
			}

			// eslint-disable-next-line no-throw-literal
			throw { message: 'FILE_SPECIFIC_ERRORS', details: errors };
		} else {
			disableLeavePageWarning();
			window.location.href = uploadForm.dataset.nextPageUrl || '';
		}
	};

	/**
		@param {Event} clickEvent
	 */
	const onSubmit = async (clickEvent) => {
		clickEvent.preventDefault();

		const { getUploadInfoFromInternalDB, uploadFiles, getVersionUploadInfoFromInternalDB } =
			serverActions(uploadForm);

		enableLeavePageWarning();

		try {
			const fileList = await onSubmitValidation();

			buildProgressMessage({ show: true }, uploadForm);

			let errors = null;
			let uploadInfo;

			if (fileList.length === 1 && uploadForm.dataset?.documentId) {
				uploadInfo = await getVersionUploadInfoFromInternalDB(fileList[0]);
			} else {
				uploadInfo = await getUploadInfoFromInternalDB(fileList);
			}

			errors = await uploadFiles(fileList, uploadInfo);

			finalizeUpload(errors);
		} catch (/** @type {*} */ error) {
			showErrors(error, uploadForm);
		}
	};

	const registerEvents = () => {
		uploadButton.addEventListener('click', (clickEvent) => {
			clickEvent.preventDefault();
			uploadInput.click();
		});
		uploadInput.addEventListener('change', onFileSelect, false);

		submitButton.addEventListener('click', onSubmit);
	};

	const leavePageWarningEventHandler = (/** @type {{ preventDefault: () => any; }} */ event) => {
		event.preventDefault();
	};

	const enableLeavePageWarning = () => {
		window.addEventListener('beforeunload', leavePageWarningEventHandler);
	};

	const disableLeavePageWarning = () => {
		window.removeEventListener('beforeunload', leavePageWarningEventHandler);
	};

	return { onFileSelect, onSubmitValidation, registerEvents };
};

export default clientActions;
