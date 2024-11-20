const SELECTORS = {
	ORIGINAL_COMMENT_IDENTIFIER: '#original-comment',
	REDACT_BUTTON_IDENTIFIER: '#redact-button',
	UNDO_BUTTON_IDENTIFIER: '#undo-button',
	TEXTAREA_IDENTIFIER: '#redact-textarea'
};

/**
 * @param {HTMLTextAreaElement} textarea
 * @returns {HTMLButtonElement['onclick']}
 */
const generateOnClick = (textarea) => (event) => {
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
 * @param {string} originalComment
 * @returns {HTMLButtonElement['onclick']}
 * */
const undoAllChanges = (textarea, originalComment) => (event) => {
	event.preventDefault();

	textarea.value = originalComment;
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

/**
 * @param {Element} element
 * @returns {element is HTMLDivElement}
 * */
const isHTMLDivElement = (element) => element instanceof HTMLDivElement;

export const initRedactButtons = () => {
	const originalCommentText = document.querySelector(SELECTORS.ORIGINAL_COMMENT_IDENTIFIER);
	const redactButton = document.querySelector(SELECTORS.REDACT_BUTTON_IDENTIFIER);
	const undoButton = document.querySelector(SELECTORS.UNDO_BUTTON_IDENTIFIER);
	const textarea = document.querySelector(SELECTORS.TEXTAREA_IDENTIFIER);

	if (
		!(
			originalCommentText &&
			redactButton &&
			textarea &&
			undoButton &&
			isHTMLDivElement(originalCommentText) &&
			isHTMLButtonElement(redactButton) &&
			isHTMLButtonElement(undoButton) &&
			isHTMLTextAreaElement(textarea)
		)
	) {
		return;
	}

	redactButton.onclick = generateOnClick(textarea);
	undoButton.onclick = undoAllChanges(textarea, originalCommentText.textContent?.trim() ?? '');
};
