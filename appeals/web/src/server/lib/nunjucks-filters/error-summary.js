import { errorMessage } from './error-message.js';
import { kebabCase } from '../../lib/nunjucks-filters/index.js';

/**
 * Map keyed errors to an array compatible with govuk error summary.
 *
 * @param {string | Object<string, {msg: string | {text: string; fieldId: string}}>} errors - A dictionary of errors.
 * @returns {Array<{ text: string; href: string }>} – The error summary errors.
 */

export function mapToErrorSummary(errors) {
	if (typeof errors === 'string') {
		return [
			{
				text: errors,
				href: '#'
			}
		];
	}
	return Object.keys(errors).map((errorName) => {
		const error = errors[errorName];
		if (typeof error?.msg === 'string') {
			return {
				href: `#${kebabCase(errorName)}`,
				text: errorMessage({ msg: error?.msg })?.text || ''
			};
		} else {
			return {
				href: `#${kebabCase(error?.msg?.fieldId || errorName)}`,
				text: errorMessage({ msg: error?.msg?.text })?.text || ''
			};
		}
	});
}
