/** @typedef {File & {guid?: string}} FileWithRowId */

const CLASSES = {
	fileRow: 'pins-file-upload__file-row',
	errorRow: 'error-row',
	headingSmall: 'govuk-heading-s',
	visuallyHidden: 'govuk-visually-hidden',
	removeButton: 'govuk-link pins-file-upload__remove',
	errorMessage: 'govuk-heading-s colour--red',
	progressMessage: 'govuk-body pins-file-upload__progress'
};

const SELECTORS = {
	progressHook: '.progress-hook',
	uploadButton: '.pins-file-upload__button',
	dropZone: '.pins-file-upload__dropzone',
	submitButton: '.pins-file-upload__submit'
};

/**
 * @param {string} type
 * @param {string?} replaceValue
 * @param {Record<string,string>?} additionalValues
 * @returns {string}
 */
export const errorMessage = (type, replaceValue, additionalValues = {}) => {
	/** @type {Record<string,string>} */
	const index = {
		GENERIC: 'Something went wrong, please try again',
		SIZE_EXCEEDED: `The total of your uploaded files is {totalFileSize} GB, it must be smaller than 1 GB`,
		ADDITIONAL_DOCUMENTS_CONFIRMATION_REQUIRED:
			'Please confirm that the document does not belong anywhere else',
		TIMEOUT: 'There was a timeout and your files could not be uploaded',
		NO_FILE: 'Select the {fileTitle}',
		SIZE_SINGLE_FILE: `The selected file must be smaller than 25MB`,
		GENERIC_SINGLE_FILE: `{REPLACE_VALUE} could not be added`,
		NAME_SINGLE_FILE: `{REPLACE_VALUE} could not be added because the file name is too long or contains special characters. Rename the file and try again.`,
		DUPLICATE_NAME_SINGLE_FILE: `"{REPLACE_VALUE}" could not be added because a file with this name already exists. Files cannot have duplicate names.`,
		DIFFERENT_FILE_EXTENSION: `The selected file must be a {fileExtension}`,
		SINGLE_FILE_ONLY: `You can only upload 1 file`
	};
	// Change text output in case of on Decision Letter page
	const mainHeading = document.querySelector('h1');
	const isDecisionLetterPage =
		(mainHeading && mainHeading.textContent?.includes('Decision Letter')) ||
		window.location.pathname.includes('decision-letter-upload');

	const fileSubject = isDecisionLetterPage ? 'The decision letter' : 'The selected file';

	let message = index[type];

	if (!message) {
		return index.GENERIC;
	}

	message = message.replace('The selected file', fileSubject);

	if (additionalValues) {
		for (const [key, value] of Object.entries(additionalValues)) {
			message = message.replace(`{${key}}`, value);
		}
	}

	return message.replace('{REPLACE_VALUE}', replaceValue || '');
};

/**
 *
 * @param {number} sizesInBytes
 * @returns {string}
 */
const renderSizeInMainUnit = (sizesInBytes) => {
	const unit = sizesInBytes > 99_999 ? 'MB' : 'KB';
	const power = sizesInBytes > 99_999 ? 1e-5 : 1e-2;

	return `${Math.round(sizesInBytes * power) / 10} ${unit}`;
};

/**
 * @param {FileWithRowId} uploadedFile
 * @returns {HTMLElement}
 */
export const buildRegularListItem = (uploadedFile) => {
	const uploadedFileFileRowId = uploadedFile.guid;
	const uploadedFileName = uploadedFile.name || '';
	const uploadedFileSize = uploadedFile.size;

	const li = document.createElement('li');
	li.className = CLASSES.fileRow;
	li.id = uploadedFileFileRowId || '';

	const p = document.createElement('p');
	p.className = CLASSES.headingSmall;

	const span = document.createElement('span');
	span.className = CLASSES.visuallyHidden;
	span.textContent = 'File name: ';
	p.appendChild(span);

	const fileNameText = document.createTextNode(
		`${uploadedFileName} (${renderSizeInMainUnit(uploadedFileSize)})`
	);
	p.appendChild(fileNameText);

	const button = document.createElement('button');
	button.id = `button-remove-${li.id}`;
	button.type = 'button';
	button.className = CLASSES.removeButton;
	button.setAttribute('aria-label', `Remove ${uploadedFileName} from list`);
	button.textContent = 'Remove';

	li.appendChild(p);
	li.appendChild(button);

	return li;
};

/**
 * Creates an HTML element for displaying an error message related to file upload.
 * @param {import('#appeals/appeal-documents/appeal-documents.types').StagedFileError} error
 * @returns {HTMLElement}
 */
export const buildErrorListItem = (error) => {
	const li = document.createElement('li');
	li.className = `${CLASSES.fileRow} ${CLASSES.errorRow}`;
	li.id = error.guid;

	const p = document.createElement('p');
	p.className = CLASSES.errorMessage;
	p.textContent = errorMessage(error.message, error.name, error.metadata);

	li.appendChild(p);

	return li;
};

/**
 * @param {Element} uploadForm
 */
export function showProgressMessage(uploadForm) {
	showOrHideProgressMessage(true, uploadForm);
}

/**
 * @param {Element} uploadForm
 */
export function hideProgressMessage(uploadForm) {
	showOrHideProgressMessage(false, uploadForm);
}

/**
 * @param {boolean} show
 * @param {Element} uploadForm
 */
const showOrHideProgressMessage = (show, uploadForm) => {
	const progressHook = uploadForm.querySelector(SELECTORS.progressHook);

	/** @type {HTMLButtonElement | null} */
	const uploadButton = uploadForm.querySelector(SELECTORS.uploadButton);

	/** @type {HTMLElement | null} */
	const dropZone = uploadForm.querySelector(SELECTORS.dropZone);

	/** @type {HTMLButtonElement | null} */
	const submitButton = uploadForm.querySelector(SELECTORS.submitButton);

	if (progressHook) {
		progressHook.innerHTML = show
			? `<p class="${CLASSES.progressMessage}" role="alert">Adding files</p>`
			: '';
	}
	if (uploadButton) {
		uploadButton.disabled = show;
	}
	if (dropZone) {
		dropZone.style.pointerEvents = show ? 'none' : '';
	}
	if (submitButton) {
		submitButton.disabled = show;
	}
};

/**
 * @param {import('#appeals/appeal-documents/appeal-documents.types').StagedFile} stagedFile
 * @returns {HTMLElement}
 */
export const buildStagedFileListItem = (stagedFile) => {
	const stagedFileFileRowId = stagedFile.guid;

	const li = document.createElement('li');
	li.className = CLASSES.fileRow;
	li.id = stagedFileFileRowId || '';

	const p = document.createElement('p');
	p.className = CLASSES.headingSmall;

	const span = document.createElement('span');
	span.className = CLASSES.visuallyHidden;
	span.textContent = 'File name: ';
	p.appendChild(span);

	const fileNameText = document.createTextNode(
		`${stagedFile.name} (${renderSizeInMainUnit(stagedFile.size)})`
	);
	p.appendChild(fileNameText);

	const button = document.createElement('button');
	button.id = `button-remove-${li.id}`;
	button.type = 'button';
	button.className = CLASSES.removeButton;
	button.setAttribute('aria-label', `Remove ${stagedFile.name} from list`);
	button.textContent = 'Remove';

	li.appendChild(p);
	li.appendChild(button);

	return li;
};
