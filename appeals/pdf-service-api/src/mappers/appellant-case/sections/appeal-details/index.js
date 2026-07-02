import { buildRows } from '../../../build-rows.js';
import { rowKeys } from './row-keys.js';
import { rowBuilders } from './rows.js';

export function appealDetailsSection(templateData) {
	if (!templateData) {
		return null;
	} else {
		return {
			heading: 'Appeal details',
			items: buildRows(templateData, rowBuilders, rowKeys)
		};
	}
}
