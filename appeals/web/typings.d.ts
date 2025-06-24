// accessible-autocomplete

declare module 'accessible-autocomplete' {
	const accessibleAutocomplete: {
		enhanceSelectElement(options: { selectElement: Element; defaultValue?: string }): void;
	};
	export default accessibleAutocomplete;
}

// govuk-frontend

declare module 'govuk-frontend' {
	export function initAll(): void;
}

// @rollup/plugin-beep

declare module '@rollup/plugin-beep' {
	export default function (): import('rollup').Plugin;
}
