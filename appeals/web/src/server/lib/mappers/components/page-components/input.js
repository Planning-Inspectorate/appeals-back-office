import { kebabCase } from 'lodash-es';

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string|null} [params.value]
 * @param {string} [params.classes]
 * @returns {PageComponent}
 */
export function textInput({ name, id, value, classes }) {
	/** @type {PageComponent} */
	const component = {
		type: 'input',
		parameters: {
			name,
			id: id || kebabCase(name),
			value,
			classes
		}
	};

	return component;
}
