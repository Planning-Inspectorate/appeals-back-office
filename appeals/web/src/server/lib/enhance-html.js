import { addConditionalHtml } from './nunjucks-filters/add-conditional-html.js';
import { renderPageComponentsToHtml } from './nunjucks-template-builders/page-component-rendering.js';

/**
 * Enhances a checkbox option with conditional HTML.
 * @param {import('#appeals/appeals.types.js').CheckboxItemParameter} option
 * @param {string} inputName
 * @param {string} inputId
 * @param {string} labelText
 */
export const enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml = (
	option,
	inputName,
	inputId,
	labelText
) => {
	const addAnotherReasonHtml = renderPageComponentsToHtml([
		{
			type: 'add-another-reason',
			parameters: {
				// @ts-ignore
				textItems: option?.addAnother?.textItems,
				inputName: inputName + option.value,
				inputId: inputId + option.value,
				labelText
			}
		}
	]);

	addConditionalHtml(option, addAnotherReasonHtml);
};
