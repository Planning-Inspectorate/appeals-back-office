import { kebabCase } from 'lodash-es';

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string|null} [params.value]
 * @param {boolean} [params.readonly]
 * @returns {PageComponent}
 */
export function textareaInput({ name, id, value, readonly }) {
	/** @type {PageComponent} */
	const component = {
		type: 'textarea',
		parameters: {
			name,
			id: id || kebabCase(name),
			value,
			attributes: { ...(readonly && { readonly }) }
		}
	};

	return component;
}
