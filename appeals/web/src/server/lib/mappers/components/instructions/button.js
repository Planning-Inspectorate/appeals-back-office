import { buttonComponent } from '../page-components/button.js';

/**
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {ButtonProperties} [options.buttonOptions]
 * @param {SharedPageComponentProperties} [options.buttonOuterOptions]
 * @returns {Instructions}
 * */
export const button = ({ id, text, buttonOptions = {}, buttonOuterOptions = {} }) => {
	return {
		id,
		display: {
			buttonItem: buttonComponent(text, buttonOptions, buttonOuterOptions)
		}
	};
};
