import { kebabCase } from 'lodash-es';

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string|null} [params.value]
 * @param {string} [params.labelText]
 * @param {boolean} [params.labelIsPageHeading]
 * @param {string} [params.labelClasses]
 * @param {boolean} [params.readonly]
 * @param {import('@pins/express').ValidationErrors|null|undefined} [params.errorMsg]
 * @returns {PageComponent}
 */
export function textareaInput({
	name,
	id,
	value,
	labelText,
	labelIsPageHeading = false,
	labelClasses,
	readonly,
	errorMsg
}) {
	/** @type {PageComponent} */
	const component = {
		type: 'textarea',
		parameters: {
			name,
			id: id || kebabCase(name),
			value,
			label: labelText && {
				text: labelText,
				isPageHeading: labelIsPageHeading,
				classes: labelClasses || 'govuk-label--l'
			},
			attributes: { ...(readonly && { readonly }) },
			errorMessage: errorMsg
				? {
						text: errorMsg
				  }
				: null
		}
	};

	return component;
}
