/** @typedef {{message: string, fileRowId: string, name: string}} AnError */
/** @typedef {File & {fileRowId?: string}} FileWithRowId */

/**
 * @param {string} type
 * @param {string?} replaceValue
 * @returns {string}
 */
export const errorMessage = (type, replaceValue) => {
	/** @type {Record<string,string>} */
	const index = {
		GENERIC: 'Something went wrong, please try again',
		SIZE_EXCEEDED:
			'The total of your uploaded files is {REPLACE_VALUE}, it must be smaller than 1 GB',
		ADDITIONAL_DOCUMENTS_CONFIRMATION_REQUIRED:
			'Please confirm that the document does not belong anywhere else',
		TIMEOUT: 'There was a timeout and your files could not be uploaded, try again',
		NO_FILE: 'Select a file',
		GENERIC_SINGLE_FILE: `{REPLACE_VALUE} could not be added, try again`,
		NAME_SINGLE_FILE: `{REPLACE_VALUE} could not be added because the file name is too long or contains special characters. Rename the file and try and upload again.`,
		TYPE_SINGLE_FILE: `{REPLACE_VALUE} could not be added because it is not an allowed file type`,
		DUPLICATE_NAME_SINGLE_FILE: `${
			replaceValue || 'One or more documents'
		} could not be uploaded because a file with the same name already exists`
	};

	return index[type] ? index[type].replace('{REPLACE_VALUE}', replaceValue || '') : index.GENERIC;
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
	const uploadedFileFileRowId = uploadedFile.fileRowId;
	const uploadedFileName = uploadedFile.name || '';
	const uploadedFileSize = uploadedFile.size;

	const li = document.createElement('li');
	li.className = 'pins-file-upload__file-row';
	li.id = uploadedFileFileRowId || '';

	const p = document.createElement('p');
	p.className = 'govuk-heading-s';

	const span = document.createElement('span');
	span.className = 'govuk-visually-hidden';
	span.textContent = 'File name: ';
	p.appendChild(span);

	const fileNameText = document.createTextNode(
		`${uploadedFileName} (${renderSizeInMainUnit(uploadedFileSize)})`
	);
	p.appendChild(fileNameText);

	const button = document.createElement('button');
	button.id = `button-remove-${li.id}`;
	button.type = 'button';
	button.className = 'govuk-link pins-file-upload__remove';
	button.setAttribute('aria-label', `Remove ${uploadedFileName} from list`);
	button.textContent = 'Remove';

	li.appendChild(p);
	li.appendChild(button);

	return li;
};

/**
 * Creates an HTML element for displaying an error message related to file upload.
 * @param {{message: string, fileRowId: string, name: string}} error
 * @returns {HTMLElement}
 */
export const buildErrorListItem = (error) => {
	const li = document.createElement('li');
	li.className = 'pins-file-upload__file-row error-row';
	li.id = error.fileRowId;

	const p = document.createElement('p');
	p.className = 'govuk-heading-s colour--red';
	p.textContent = errorMessage(error.message, error.name);

	li.appendChild(p);

	return li;
};

/**
 *
 * @param {{show: boolean}} options
 * @param {Element} uploadForm
 */
export const buildProgressMessage = ({ show }, uploadForm) => {
	const progressHook = uploadForm.querySelector('.progress-hook');
	/** @type {HTMLButtonElement | null} */
	const submitButton = uploadForm.querySelector('.pins-file-upload__submit');

	if (progressHook && submitButton) {
		submitButton.disabled = show;
		progressHook.innerHTML = show
			? '<p class="govuk-body pins-file-upload__progress" role="alert">Uploading files</p>'
			: '';
	}
};
