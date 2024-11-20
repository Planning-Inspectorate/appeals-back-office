import { kebabCase } from 'lodash-es';

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string|null} [params.value]
 * @returns {PageComponent}
 */
export function textareaInput({ name, id, value }) {
	/** @type {PageComponent} */
	const component = {
		type: 'textarea',
		parameters: {
			name,
			id: id || kebabCase(name),
			value
		}
	};

	return component;
}
