export const SELECTORS = {
	ORIGINAL_COMMENT_IDENTIFIER: '#original-comment',
	REDACT_BUTTON_IDENTIFIER: '#redact-button',
	UNDO_BUTTON_IDENTIFIER: '#undo-button',
	TEXTAREA_IDENTIFIER: '#redact-textarea',
	REVERT_BUTTON: '#revert-button',
	SAVED_TEXTAREA: '#saved-textarea'
};

/**
 * @param {HTMLTextAreaElement} textarea
 * @returns {HTMLButtonElement['onclick']}
 */
export const generateOnClick = (textarea) => (event) => {
	// Stop the form submitting
	event.preventDefault();

	const { selectionStart, selectionEnd, value } = textarea;

	// Return early if nothing is selected
	if (selectionStart === selectionEnd) {
		return;
	}

	const startBlock = value.substring(0, selectionStart);
	const endBlock = value.substring(selectionEnd);
	const replacement = '█'.repeat(selectionEnd - selectionStart);

	textarea.value = startBlock + replacement + endBlock;
};

/**
 * @param {HTMLTextAreaElement} textarea
 * @param {string} redactedText
 * @returns {HTMLButtonElement['onclick']}
 * */
export const setAreaText = (textarea, redactedText) => (event) => {
	event.preventDefault();
	textarea.value = redactedText;
};

/**
 * @param {Element} element
 * @returns {element is HTMLTextAreaElement}
 */
export const isHTMLTextAreaElement = (element) => element instanceof HTMLTextAreaElement;
/**
 * @param {Element} element
 * @returns {element is HTMLButtonElement}
 */
export const isHTMLButtonElement = (element) => element instanceof HTMLButtonElement;

/**
 * @param {Element} element
 * @returns {element is HTMLDivElement}
 * */
export const isHTMLDivElement = (element) => element instanceof HTMLDivElement;

export const initRedactButtons = () => {
	const originalCommentText = document.querySelector(SELECTORS.ORIGINAL_COMMENT_IDENTIFIER);
	const redactButton = document.querySelector(SELECTORS.REDACT_BUTTON_IDENTIFIER);
	const undoButton = document.querySelector(SELECTORS.UNDO_BUTTON_IDENTIFIER);
	const revertButton = document.querySelector(SELECTORS.REVERT_BUTTON);
	const textarea = document.querySelector(SELECTORS.TEXTAREA_IDENTIFIER);
	const savedTextarea = document.querySelector(SELECTORS.SAVED_TEXTAREA);
	const savedRedaction = savedTextarea?.textContent?.trim() || '';

	if (
		!(
			originalCommentText &&
			redactButton &&
			textarea &&
			undoButton &&
			revertButton &&
			isHTMLDivElement(originalCommentText) &&
			isHTMLButtonElement(redactButton) &&
			isHTMLButtonElement(revertButton) &&
			isHTMLButtonElement(undoButton) &&
			isHTMLTextAreaElement(textarea)
		)
	) {
		return;
	}

	redactButton.onclick = generateOnClick(textarea);
	undoButton.onclick = setAreaText(textarea, savedRedaction);
	revertButton.onclick = setAreaText(textarea, originalCommentText.textContent?.trim() ?? '');
};
