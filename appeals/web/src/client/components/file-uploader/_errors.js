import { buildProgressMessage, errorMessage } from './_html.js';

/** @typedef {import('./_html.js').AnError} AnError */

/**
 * @param {string[]} messages
 * @returns {HTMLElement}
 */
const buildTopErrorsMarkup = (messages) => {
	const div = document.createElement('div');
	div.className = 'govuk-error-summary pins-file-upload__errors-top';
	div.setAttribute('aria-labelledby', 'error-summary-title-{{ params.formId }}');
	div.setAttribute('role', 'alert');
	div.setAttribute('data-module', 'govuk-error-summary');

	const h2 = document.createElement('h2');
	h2.className = 'govuk-error-summary__title';
	h2.id = 'error-summary-title-{{ params.formId }}';
	h2.textContent = 'There is a problem';

	const ul = document.createElement('ul');
	ul.className = 'govuk-list govuk-error-summary__list';

	messages.forEach((message) => {
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.href = '#';
		a.textContent = message;
		li.appendChild(a);
		ul.appendChild(li);
	});

	div.appendChild(h2);
	div.appendChild(ul);
	return div;
};

/**
 * @param {string} message
 * @returns {HTMLElement}
 */
const buildMiddleErrorsMarkup = (message) => {
	const p = document.createElement('p');
	p.className = 'font-weight--700 colour--red';
	p.textContent = message;
	return p;
};

/**
 *
 * @param {{details: AnError[], message: string}} error
 * @param {Element} uploadForm
 */
export const showErrors = (error, uploadForm) => {
	const formContainer = uploadForm.querySelector('.pins-file-upload__container');
	const topHook = uploadForm.querySelector('.top-errors-hook');
	const middleHook = uploadForm.querySelector('.middle-errors-hook');

	if (!formContainer || !topHook || !middleHook) return;

	buildProgressMessage({ show: false }, uploadForm);
	formContainer.classList.remove('error');

	topHook.textContent = '';
	middleHook.textContent = '';

	if (error.message === 'FILE_SPECIFIC_ERRORS' && error.details) {
		const messages = error.details.map((wrongFile) =>
			errorMessage(wrongFile.message || '', wrongFile.name)
		);

		for (const wrongFile of error.details) {
			const fileRow = uploadForm.querySelector(`#${CSS.escape(wrongFile.fileRowId)}`);

			if (fileRow && fileRow.children.length > 1) {
				fileRow.children[0].classList.add('colour--red');
				fileRow.children[0].textContent = errorMessage(wrongFile.message || '', wrongFile.name);
				if (fileRow.children[1]) fileRow.children[1].remove();
			}
		}
		const topErrorsElement = buildTopErrorsMarkup(messages);
		topHook.appendChild(topErrorsElement);
	} else {
		formContainer.classList.add('error');

		const replaceValue = error.details ? error.details[0].message : null;

		const topErrorsElement = buildTopErrorsMarkup([errorMessage(error.message, replaceValue)]);
		topHook.appendChild(topErrorsElement);

		const middleErrorsElement = buildMiddleErrorsMarkup(errorMessage(error.message, replaceValue));
		middleHook.appendChild(middleErrorsElement);
	}
};

/**
 * @param {HTMLElement} uploadForm
 */
export const hideErrors = (uploadForm) => {
	const formContainer = uploadForm.querySelector('.pins-file-upload__container');
	const topHook = uploadForm.querySelector('.top-errors-hook');
	const middleHook = uploadForm.querySelector('.middle-errors-hook');
	const filesRows = uploadForm.querySelector('.pins-file-upload__files-rows');

	if (!formContainer || !topHook || !middleHook || !filesRows) return;

	const errorRows = filesRows.querySelectorAll('.error-row');
	for (const errorRow of errorRows) {
		errorRow.remove();
	}
	topHook.textContent = '';
	middleHook.textContent = '';
	formContainer.classList.remove('error');
};
