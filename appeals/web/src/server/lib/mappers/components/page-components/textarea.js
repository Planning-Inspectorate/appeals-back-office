import { kebabCase } from 'lodash-es';

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string|null} [params.value]
 * @param {boolean} [params.readonly]
 * @param {{ text: string, classes: string }} [params.label]
 * @returns {PageComponent}
 */
export function textareaInput({ name, id, value, readonly, label }) {
	/** @type {PageComponent} */
	const component = {
		type: 'textarea',
		parameters: {
			name,
			id: id || kebabCase(name),
			value,
			label,
			attributes: { ...(readonly && { readonly }) }
		}
	};

	return component;
}
