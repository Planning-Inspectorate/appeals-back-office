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

const getPreviewTextFromFullText = (
	/** @type {ShowMoreComponentInstance} */ componentInstance,
	/** @type {string} */ fullText
) => {
	return fullText.substring(0, componentInstance.options.maximumCharactersBeforeHiding);
};

const htmlModeToggleExpanded = (/** @type {ShowMoreComponentInstance} */ componentInstance) => {
	const rowSelector = componentInstance.elements.root.getAttribute(ATTRIBUTES.contentRowSelector);
	const rows = componentInstance.elements.root.querySelectorAll(rowSelector);

	Array.from(rows)?.forEach((row, index) => {
		row.style.display =
			!componentInstance.state.expanded &&
			index >= componentInstance.options.maximumRowsBeforeHiding
				? 'none'
				: '';
	});
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

const awaitInnerText = async (
	/** @type {ShowMoreComponentInstance} */ componentInstance,
	depth = 0
) => {
	if (componentInstance.elements.root.innerText || depth > 100) {
		if (depth > 100 && !componentInstance.elements.root.innerText) {
			console.warn('Failed to find inner text when initialising show more');
		}
		return;
	}
	await (() =>
		new Promise((resolve) => {
			setTimeout(resolve, 50);
		}))();
	return awaitInnerText(componentInstance, depth + 1);
};

const initialiseTextMode = async (/** @type {ShowMoreComponentInstance} */ componentInstance) => {
	await awaitInnerText(componentInstance);

	console.log('Setting attrs');

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

	const ellipsisSpan = document.createElement('span');

	ellipsisSpan.className = CLASSES.ellipsis;
	ellipsisSpan.setAttribute('aria-hidden', 'true');
	ellipsisSpan.textContent = '…';

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

const initialiseComponentInstance = async (
	/** @type {ShowMoreComponentInstance} */ componentInstance
) => {
	initialiseOptions(componentInstance);

	if (isHtmlMode(componentInstance)) {
		htmlModeToggleExpanded(componentInstance);
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

export default initialiseShowMore;
