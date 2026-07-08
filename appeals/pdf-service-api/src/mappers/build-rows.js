import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/**
 * Supports conditional row key definitions in the `rowKeys` configuration.
 * A row key item can either be a simple string (e.g. `'appellantStatement'`) or a conditional
 * object like this: `{ key: string, condition: (data: any) => boolean }`.
 * If the condition function returns `false` for the given template data, the row is excluded.
 *
 * @param {any} templateData The raw data passed to the template rendering context.
 * @param {Record<string, (data: any) => any>} rowBuilders Map of row key identifiers to builder functions.
 * @param {Record<string, Array<string | { key: string, condition: (data: any) => boolean }>>} rowKeys Map of appeal types to lists of active row configurations.
 * @returns {any[]} Array of built row objects for the PDF layout.
 */
export const buildRows = (templateData, rowBuilders, rowKeys) => {
	if (!templateData || !templateData.appealType) {
		console.warn('Template data or appeal type is missing. Cannot build constraints rows.');
		return [];
	}
	const isS78Expedited = templateData.isS78Expedited || false;
	const appealType = isS78Expedited ? APPEAL_TYPE.S78_EXPEDITED : templateData.appealType;

	const constraintRowKeys = rowKeys[appealType] || [];

	if (constraintRowKeys.length === 0) {
		console.warn(`No row keys defined for appeal type: ${appealType}`);
	}

	return constraintRowKeys
		.map((/** @type {any} */ item) => {
			let key;
			if (typeof item === 'object' && item !== null) {
				if (typeof item.condition === 'function' && !item.condition(templateData)) {
					return null;
				}
				key = item.key;
			} else {
				key = item;
			}

			const rowBuilder = rowBuilders[key];
			if (typeof rowBuilder !== 'function') {
				console.warn(`No row builder function found for key: ${key}`);
				return null;
			}
			return rowBuilder(templateData);
		})
		.filter(Boolean);
};
