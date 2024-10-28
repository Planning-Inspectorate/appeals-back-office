const BUTTON_IDENTIFIER = '#redact-button';
const TEXTAREA_IDENTIFIER = '#redact-textarea';

/**
 * @param {HTMLTextAreaElement} textarea
 */
const generateOnClick = (textarea) => () => {
	const { selectionStart, selectionEnd, value } = textarea;

	console.log(selectionStart, selectionEnd, value);

	const startBlock = value.substring(0, selectionStart);
	const endBlock = value.substring(selectionEnd);

	textarea.value = startBlock + '(Redacted)' + endBlock;
};

/**
 * @param {Element} element
 * @returns {element is HTMLTextAreaElement}
 */
const isHTMLTextAreaElement = (element) => element instanceof HTMLTextAreaElement;

/**
 * @param {Element} element
 * @returns {element is HTMLButtonElement}
 */
const isHTMLButtonElement = (element) => element instanceof HTMLButtonElement;

export const initRedactButton = () => {
	const button = document.querySelector(BUTTON_IDENTIFIER);
	const textarea = document.querySelector(TEXTAREA_IDENTIFIER);

	if (!button || !textarea || !isHTMLButtonElement(button) || !isHTMLTextAreaElement(textarea)) {
		return;
	}

	button.onclick = generateOnClick(textarea);
};
