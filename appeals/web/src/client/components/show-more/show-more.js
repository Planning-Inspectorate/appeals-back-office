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
		textContainer.innerText = componentInstance.elements.root.getAttribute(ATTRIBUTES.fullText);
		toggleButtonTextContainer.innerText = DEFAULT_OPTIONS.toggleButtonTextExpanded;
	} else {
		textContainer.innerText = getPreviewFromFullText(
			componentInstance.elements.root.getAttribute(ATTRIBUTES.fullText)
		);
		toggleButtonTextContainer.innerText = DEFAULT_OPTIONS.toggleButtonTextCollapsed;
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

	const html = `
		<span class="${CLASSES.text}">${previewText}</span>
		<span class="${CLASSES.ellipsis}" aria-hidden="true">&hellip;</span>
		<button class="${CLASSES.toggleButton}" aria-expanded="false">
		<span class="${CLASSES.toggleButtonLabel}">${DEFAULT_OPTIONS.toggleButtonTextCollapsed}</span>
		<span class="govuk-visually-hidden">, ${labelText}</span>
		</button>
	`;

	componentInstance.elements.root.innerHTML = html;

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
