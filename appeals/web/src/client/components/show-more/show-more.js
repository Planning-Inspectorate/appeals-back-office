/**
 * @typedef ShowMoreComponentInstance
 * @type {Object<string, any>}
 * @property {'text'|'html'} mode
 * @property {Object<string, string>} options
 * @property {string?} options.maximumBeforeHiding
 * @property {string?} options.toggleTextCollapsed
 * @property {string?} options.toggleTextExpanded
 * @property {Object<string, HTMLElement>} elements
 * @property {HTMLElement} elements.root
 * @property {Object<string, any>} state
 * @property {boolean} state.expanded
 */

const CLASSES = {
	content: 'pins-show-more__content',
	ellipsis: 'pins-show-more__ellipsis',
	toggleButton: 'pins-show-more__toggle',
	toggleButtonLabel: 'pins-show-more__toggle-label'
};

const SELECTORS = {
	container: '.pins-show-more'
};

const ATTRIBUTES = {
	mode: 'data-mode',
	label: 'data-label',
	fullText: 'data-full-text',
	contentRowSelector: 'data-content-row-selector',
	maximumBeforeHiding: 'data-max-before-hiding',
	toggleTextCollapsed: 'data-toggle-text-collapsed',
	toggleTextExpanded: 'data-toggle-text-expanded'
};

const DEFAULT_OPTIONS = {
	maximumCharactersBeforeHiding: 300,
	maximumRowsBeforeHiding: 3,
	toggleButtonTextCollapsed: 'Read more',
	toggleButtonTextExpanded: 'Close'
};

const isHtmlMode = (/** @type {ShowMoreComponentInstance} */ componentInstance) => {
	return componentInstance.elements.root.getAttribute(ATTRIBUTES.mode) === 'html';
};

const getPreviewTextFromHtmlText = (
	/** @type {ShowMoreComponentInstance} */ componentInstance,
	/** @type {string} */ htmlText
) => {
	return substringWithTags(htmlText, componentInstance.options.maximumCharactersBeforeHiding);
};

const getPreviewTextFromFullText = (
	/** @type {ShowMoreComponentInstance} */ componentInstance,
	/** @type {string} */ fullText
) => {
	return fullText.substring(0, componentInstance.options.maximumCharactersBeforeHiding);
};

const htmlModeToggleExpandedNoRowSelector = (
	/** @type {ShowMoreComponentInstance} */ componentInstance
) => {
	componentInstance.elements.root.querySelector(`.${CLASSES.ellipsis}`).style.display =
		componentInstance.state.expanded ? 'none' : '';
	const content = componentInstance.elements.root.querySelector(`.${CLASSES.content}`);

	content.innerHTML = componentInstance.state.expanded
		? `${componentInstance.elements.root.getAttribute(ATTRIBUTES.fullText)} `
		: getPreviewTextFromHtmlText(
				componentInstance,
				componentInstance.elements.root.getAttribute(ATTRIBUTES.fullText)
			);
};

const htmlModeToggleExpanded = (/** @type {ShowMoreComponentInstance} */ componentInstance) => {
	const rowSelector = componentInstance.elements.root.getAttribute(ATTRIBUTES.contentRowSelector);

	rowSelector
		? toggleRows(componentInstance, rowSelector)
		: htmlModeToggleExpandedNoRowSelector(componentInstance);
};

const textModeToggleExpanded = (/** @type {ShowMoreComponentInstance} */ componentInstance) => {
	const textContainer = componentInstance.elements.root.querySelector(`.${CLASSES.content}`);

	textContainer.textContent = componentInstance.state.expanded
		? `${componentInstance.elements.root.getAttribute(ATTRIBUTES.fullText)} `
		: getPreviewTextFromFullText(
				componentInstance,
				componentInstance.elements.root.getAttribute(ATTRIBUTES.fullText)
			);
};

const toggleExpanded = (/** @type {ShowMoreComponentInstance} */ componentInstance) => {
	componentInstance.state.expanded = !componentInstance.state.expanded;

	const toggleButton = componentInstance.elements.root.querySelector(`.${CLASSES.toggleButton}`);
	toggleButton.setAttribute('aria-expanded', `${componentInstance.state.expanded}`);

	const toggleButtonTextContainer = toggleButton.querySelector(`.${CLASSES.toggleButtonLabel}`);
	toggleButtonTextContainer.textContent = componentInstance.state.expanded
		? componentInstance.options.toggleButtonTextExpanded
		: componentInstance.options.toggleButtonTextCollapsed;

	if (isHtmlMode(componentInstance)) {
		htmlModeToggleExpanded(componentInstance);
	} else {
		componentInstance.elements.root.querySelector(`.${CLASSES.ellipsis}`).style.display =
			componentInstance.state.expanded ? 'none' : '';
		textModeToggleExpanded(componentInstance);
	}
};

const bindEvents = (/** @type {ShowMoreComponentInstance} */ componentInstance) => {
	componentInstance.elements.root
		.querySelector(`.${CLASSES.toggleButton}`)
		.addEventListener('click', () => {
			toggleExpanded(componentInstance);
		});
};

// N.B. maximum total timeout will be the product of these
const INNER_TEXT_TIMEOUT = 50;
const INNER_TEXT_DEPTH = 100;
/**
 *
 * @param {ShowMoreComponentInstance} componentInstance
 * @param {number} [depth]
 * @returns {Promise<void>}
 */
const awaitInnerText = async (componentInstance, depth = 0) => {
	if (componentInstance.elements.root.innerText || depth > INNER_TEXT_DEPTH) {
		if (depth > INNER_TEXT_DEPTH && !componentInstance.elements.root.innerText) {
			console.warn('Failed to find inner text when initialising show more');
		}
		return;
	}
	await (() =>
		new Promise((resolve) => {
			setTimeout(resolve, INNER_TEXT_TIMEOUT);
		}))();
	return awaitInnerText(componentInstance, depth + 1);
};

const initialiseHtmlModeNoRowSelector = (
	/** @type {ShowMoreComponentInstance} */ componentInstance
) => {
	componentInstance.elements.root.setAttribute(
		ATTRIBUTES.fullText,
		componentInstance.elements.root.innerHTML
	);
	const ellipsisSpan = createEllipsisSpan();

	const contentSpan = document.createElement('span');
	contentSpan.className = CLASSES.content;
	contentSpan.innerHTML = getPreviewTextFromHtmlText(
		componentInstance,
		componentInstance.elements.root.innerHTML
	);

	componentInstance.elements.root.innerHTML = '';
	componentInstance.elements.root.appendChild(contentSpan);
	componentInstance.elements.root.appendChild(ellipsisSpan);
};

const initialiseHtmlMode = (/** @type {ShowMoreComponentInstance} */ componentInstance) => {
	const rowSelector = componentInstance.elements.root.getAttribute(ATTRIBUTES.contentRowSelector);

	rowSelector
		? toggleRows(componentInstance, rowSelector)
		: initialiseHtmlModeNoRowSelector(componentInstance);
};

const initialiseTextMode = async (/** @type {ShowMoreComponentInstance} */ componentInstance) => {
	await awaitInnerText(componentInstance);

	componentInstance.elements.root.setAttribute(
		ATTRIBUTES.fullText,
		componentInstance.elements.root.innerText
	);

	const contentSpan = document.createElement('span');
	contentSpan.className = CLASSES.content;
	contentSpan.textContent = getPreviewTextFromFullText(
		componentInstance,
		componentInstance.elements.root.innerText
	);

	const ellipsisSpan = createEllipsisSpan();

	componentInstance.elements.root.innerHTML = '';
	componentInstance.elements.root.appendChild(contentSpan);
	componentInstance.elements.root.appendChild(ellipsisSpan);
};

const initialiseOptions = (/** @type {ShowMoreComponentInstance} */ componentInstance) => {
	const htmlMode = isHtmlMode(componentInstance);
	const maximumBeforeHidingOverride = componentInstance.elements.root.getAttribute(
		ATTRIBUTES.maximumBeforeHiding
	);
	const toggleTextCollapsedOverride = componentInstance.elements.root.getAttribute(
		ATTRIBUTES.toggleTextCollapsed
	);
	const toggleTextExpandedOverride = componentInstance.elements.root.getAttribute(
		ATTRIBUTES.toggleTextExpanded
	);

	componentInstance.options = {
		maximumCharactersBeforeHiding:
			!htmlMode && maximumBeforeHidingOverride
				? maximumBeforeHidingOverride
				: DEFAULT_OPTIONS.maximumCharactersBeforeHiding,
		maximumRowsBeforeHiding:
			htmlMode && maximumBeforeHidingOverride
				? maximumBeforeHidingOverride
				: DEFAULT_OPTIONS.maximumRowsBeforeHiding,
		toggleButtonTextCollapsed:
			toggleTextCollapsedOverride || DEFAULT_OPTIONS.toggleButtonTextCollapsed,
		toggleButtonTextExpanded: toggleTextExpandedOverride || DEFAULT_OPTIONS.toggleButtonTextExpanded
	};
};

const shouldInitialiseComponentInstance = (
	/** @type {ShowMoreComponentInstance} */ componentInstance
) => {
	const rowSelector = componentInstance.elements.root.getAttribute(ATTRIBUTES.contentRowSelector);
	if (rowSelector != null && isHtmlMode(componentInstance)) {
		const rows = componentInstance.elements.root.querySelectorAll(rowSelector);

		if (rows.length <= componentInstance.options.maximumRowsBeforeHiding) {
			return false;
		}
	} else if (
		componentInstance.elements.root.innerText.length <=
		componentInstance.options.maximumCharactersBeforeHiding
	) {
		return false;
	}

	return true;
};

const initialiseComponentInstance = async (
	/** @type {ShowMoreComponentInstance} */ componentInstance
) => {
	initialiseOptions(componentInstance);

	if (!shouldInitialiseComponentInstance(componentInstance)) {
		return;
	}

	if (isHtmlMode(componentInstance)) {
		initialiseHtmlMode(componentInstance);
	} else {
		await initialiseTextMode(componentInstance);
	}

	const button = document.createElement('button');
	button.className = CLASSES.toggleButton;
	button.setAttribute('aria-expanded', 'false');
	button.setAttribute('type', 'button');

	const buttonLabel = document.createElement('span');
	buttonLabel.className = CLASSES.toggleButtonLabel;
	buttonLabel.textContent = componentInstance.options.toggleButtonTextCollapsed;

	const visuallyHiddenText = document.createElement('span');
	visuallyHiddenText.className = 'govuk-visually-hidden';
	const labelText = componentInstance.elements.root.getAttribute(ATTRIBUTES.label);
	visuallyHiddenText.textContent = `, ${labelText}`;

	button.appendChild(buttonLabel);
	button.appendChild(visuallyHiddenText);

	componentInstance.elements.root.appendChild(button);

	bindEvents(componentInstance);
};

const initialiseShowMore = () => {
	/** @type {NodeListOf<HTMLElement>} */
	const componentElementInstances = document.querySelectorAll(SELECTORS.container);

	componentElementInstances.forEach(async (componentElementInstance) => {
		/** @type {ShowMoreComponentInstance} */
		const componentInstance = {
			mode: 'text',
			options: {},
			elements: {
				root: componentElementInstance
			},
			state: {
				expanded: false
			}
		};
		await initialiseComponentInstance(componentInstance);
	});
};

const createEllipsisSpan = () => {
	const ellipsisSpan = document.createElement('span');
	ellipsisSpan.className = CLASSES.ellipsis;
	ellipsisSpan.setAttribute('aria-hidden', 'true');
	ellipsisSpan.textContent = '…';

	return ellipsisSpan;
};

/**
 *
 * @param {ShowMoreComponentInstance} componentInstance
 * @param {String} rowSelector
 * @returns {void}
 */
const toggleRows = (componentInstance, rowSelector) => {
	const rows = componentInstance.elements.root.querySelectorAll(rowSelector);

	Array.from(rows)?.forEach((row, index) => {
		row.style.display =
			!componentInstance.state.expanded &&
			index >= componentInstance.options.maximumRowsBeforeHiding
				? 'none'
				: '';
	});
};

/**
 * Creates a substring of the specified length while maintaining HTML tags.
 * @param {string} htmlString - The input string containing HTML tags.
 * @param {number} length - The desired length of the substring.
 * @returns {string} - The substring with HTML tags maintained.
 */
const substringWithTags = (htmlString, length) => {
	let count = 0;
	let inTag = false;
	let result = '';

	for (let i = 0; i < htmlString.length; i++) {
		if (htmlString[i] === '<') {
			inTag = true;
		} else if (htmlString[i] === '>') {
			inTag = false;
		} else if (!inTag) {
			count++;
		}

		result += htmlString[i];

		if (count === length) {
			break;
		}
	}

	// Add any remaining tags to close properly
	if (inTag) {
		let i = 0;
		while (htmlString[i] !== '>') {
			result += htmlString[i];
			i++;
		}
		result += '>';
	}

	return result;
};

export default initialiseShowMore;
