// @ts-nocheck
const CLASSES = {
	text: 'pins-show-more__text',
	ellipsis: 'pins-show-more__ellipsis',
	toggleButton: 'pins-show-more__toggle',
	toggleButtonLabel: 'pins-show-more__toggle-label'
};

const SELECTORS = {
	container: '.pins-show-more'
};

const ATTRIBUTES = {
	label: 'data-label',
	fullText: 'data-full-text'
};

const DEFAULT_OPTIONS = {
	maximumCharactersBeforeHiding: 300,
	toggleButtonTextCollapsed: 'Read more',
	toggleButtonTextExpanded: 'Close'
};

const getPreviewFromFullText = (fullText) => {
	return fullText.substring(0, DEFAULT_OPTIONS.maximumCharactersBeforeHiding);
};

const toggleExpanded = (componentInstance) => {
	componentInstance.state.expanded = !componentInstance.state.expanded;

	const toggleButton = componentInstance.elements.root.querySelector(`.${CLASSES.toggleButton}`);
	const textContainer = componentInstance.elements.root.querySelector(`.${CLASSES.text}`);
	const toggleButtonTextContainer = toggleButton.querySelector(`.${CLASSES.toggleButtonLabel}`);

	toggleButton.setAttribute('aria-expanded', `${componentInstance.state.expanded}`);

	if (componentInstance.state.expanded) {
		textContainer.textContent = componentInstance.elements.root.getAttribute(ATTRIBUTES.fullText);
		toggleButtonTextContainer.textContent = DEFAULT_OPTIONS.toggleButtonTextExpanded;
	} else {
		textContainer.textContent = getPreviewFromFullText(
			componentInstance.elements.root.getAttribute(ATTRIBUTES.fullText)
		);
		toggleButtonTextContainer.textContent = DEFAULT_OPTIONS.toggleButtonTextCollapsed;
	}

	componentInstance.elements.root.querySelector(`.${CLASSES.ellipsis}`).style.display =
		componentInstance.state.expanded ? 'none' : '';
};

const bindEvents = (componentInstance) => {
	componentInstance.elements.root
		.querySelector(`.${CLASSES.toggleButton}`)
		.addEventListener('click', () => {
			toggleExpanded(componentInstance);
		});
};

const initComponentInstance = (componentInstance) => {
	if (
		componentInstance.elements.root.innerText.length <=
		DEFAULT_OPTIONS.maximumCharactersBeforeHiding
	) {
		return;
	}

	componentInstance.elements.root.setAttribute(
		ATTRIBUTES.fullText,
		componentInstance.elements.root.innerText
	);

	const previewText = getPreviewFromFullText(componentInstance.elements.root.innerText);
	const labelText = componentInstance.elements.root.getAttribute(ATTRIBUTES.label);

	const textSpan = document.createElement('span');
	textSpan.className = CLASSES.text;
	textSpan.textContent = previewText;

	const ellipsisSpan = document.createElement('span');
	ellipsisSpan.className = CLASSES.ellipsis;
	ellipsisSpan.setAttribute('aria-hidden', 'true');
	ellipsisSpan.textContent = '…';

	const button = document.createElement('button');
	button.className = CLASSES.toggleButton;
	button.setAttribute('aria-expanded', 'false');

	const buttonLabel = document.createElement('span');
	buttonLabel.className = CLASSES.toggleButtonLabel;
	buttonLabel.textContent = DEFAULT_OPTIONS.toggleButtonTextCollapsed;

	const visuallyHiddenText = document.createElement('span');
	visuallyHiddenText.className = 'govuk-visually-hidden';
	visuallyHiddenText.textContent = `, ${labelText}`;

	button.appendChild(buttonLabel);
	button.appendChild(visuallyHiddenText);

	componentInstance.elements.root.innerHTML = '';
	componentInstance.elements.root.appendChild(textSpan);
	componentInstance.elements.root.appendChild(ellipsisSpan);
	componentInstance.elements.root.appendChild(button);

	bindEvents(componentInstance);
};

const initShowMore = () => {
	/** @type {NodeListOf<HTMLElement>} */
	const componentElementInstances = document.querySelectorAll(SELECTORS.container);

	componentElementInstances.forEach((componentElementInstance) => {
		const componentInstance = {
			elements: {
				root: componentElementInstance
			},
			state: {
				expanded: false
			}
		};
		initComponentInstance(componentInstance);
	});
};

export default initShowMore;
