import { errorMessage } from './_html.js';

const CLASSES = {
	topErrors: 'govuk-error-summary pins-file-upload__errors-top',
	errorSummaryTitle: 'govuk-error-summary__title',
	errorSummaryList: 'govuk-list govuk-error-summary__list',
	fileRowRed: 'colour--red'
};
const SELECTORS = {
	container: '.pins-file-upload__container',
	topErrorsHook: '.top-errors-hook',
	filesRows: '.pins-file-upload__files-rows',
	errorRow: '.error-row'
};

/**
 * @param {{message: string; guid: string;}[]} errors
 * @returns {HTMLElement}
 */
const buildTopErrorsMarkup = (errors) => {
	const div = document.createElement('div');
	div.className = CLASSES.topErrors;
	div.setAttribute('aria-labelledby', 'error-summary-title-{{ params.formId }}');
	div.setAttribute('role', 'alert');
	div.setAttribute('data-module', 'govuk-error-summary');

	const h2 = document.createElement('h2');
	h2.className = CLASSES.errorSummaryTitle;
	h2.id = 'error-summary-title-{{ params.formId }}';
	h2.textContent = 'There is a problem';

	const ul = document.createElement('ul');
	ul.className = CLASSES.errorSummaryList;

	errors.forEach((errorItem) => {
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.href = `#${errorItem.guid}`;
		a.textContent = errorItem.message;
		li.appendChild(a);
		ul.appendChild(li);
	});

	div.appendChild(h2);
	div.appendChild(ul);
	return div;
};

/**
 *
 * @param {{message: string, details?: import('#appeals/appeal-documents/appeal-documents.types').FileUploadError[]}} error
 * @param {Element} uploadForm
 */
export const showErrors = (error, uploadForm) => {
	const formContainer = uploadForm.querySelector(SELECTORS.container);
	const topHook = uploadForm.querySelector(SELECTORS.topErrorsHook);

	if (!formContainer || !topHook) return;

	formContainer.classList.remove('error');

	topHook.textContent = '';

	if (error.message === 'FILE_SPECIFIC_ERRORS' && error.details) {
		const errors = error.details.map((errorDetails) => ({
			message: errorMessage(errorDetails.message || '', errorDetails.name),
			guid: errorDetails.guid
		}));

		for (const errorDetails of error.details) {
			const fileRow = uploadForm.querySelector(`#${CSS.escape(errorDetails.guid)}`);

			if (fileRow && fileRow.children.length > 1) {
				fileRow.children[0].classList.add(CLASSES.fileRowRed);
				fileRow.children[0].textContent = errorMessage(
					errorDetails.message || '',
					errorDetails.name
				);
				if (fileRow.children[1]) fileRow.children[1].remove();
			}
		}
		const topErrorsElement = buildTopErrorsMarkup(errors);
		topHook.appendChild(topErrorsElement);
	} else {
		formContainer.classList.add('error');

		const replaceValue = error.details ? error.details[0].message : null;
		const topErrorsElement = buildTopErrorsMarkup([
			{
				message: errorMessage(error.message, replaceValue),
				guid: '#'
			}
		]);
		topHook.appendChild(topErrorsElement);
	}
};

/**
 * @param {HTMLElement} uploadForm
 */
export const hideErrors = (uploadForm) => {
	const formContainer = uploadForm.querySelector(SELECTORS.container);
	const topHook = uploadForm.querySelector(SELECTORS.topErrorsHook);
	const filesRows = uploadForm.querySelector(SELECTORS.filesRows);

	if (!formContainer || !topHook || !filesRows) return;

	const errorRows = filesRows.querySelectorAll(SELECTORS.errorRow);
	for (const errorRow of errorRows) {
		errorRow.remove();
	}
	topHook.textContent = '';
	formContainer.classList.remove('error');
};
