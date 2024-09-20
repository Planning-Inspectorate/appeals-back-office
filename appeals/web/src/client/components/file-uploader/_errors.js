import { errorMessage } from './_html.js';

/**
 * @param {{message: string; guid: string;}[]} errors
 * @returns {HTMLElement}
 */
const buildTopErrorsMarkup = (errors) => {
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
 * @param {{details: import('@pins/appeals/index.js').FileUploadError[], message: string}} error
 * @param {Element} uploadForm
 */
export const showErrors = (error, uploadForm) => {
	const formContainer = uploadForm.querySelector('.pins-file-upload__container');
	const topHook = uploadForm.querySelector('.top-errors-hook');

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
				fileRow.children[0].classList.add('colour--red');
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
	const formContainer = uploadForm.querySelector('.pins-file-upload__container');
	const topHook = uploadForm.querySelector('.top-errors-hook');
	const filesRows = uploadForm.querySelector('.pins-file-upload__files-rows');

	if (!formContainer || !topHook || !filesRows) return;

	const errorRows = filesRows.querySelectorAll('.error-row');
	for (const errorRow of errorRows) {
		errorRow.remove();
	}
	topHook.textContent = '';
	formContainer.classList.remove('error');
};
