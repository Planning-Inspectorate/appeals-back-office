/**
 * @param {string} text
 * @param {ButtonProperties} [options]
 * @param {SharedPageComponentProperties} [outerOptions]
 * @returns {PageComponent}
 * */
export const buttonComponent = (text, options = {}, outerOptions = {}) => ({
	type: 'button',
	parameters: {
		text,
		...options
	},
	...outerOptions
});
