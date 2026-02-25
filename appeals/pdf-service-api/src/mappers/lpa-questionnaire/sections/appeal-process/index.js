import { buildRows } from '../build-rows.js';
import { rowKeys } from './row-keys.js';
import { rowBuilders } from './rows.js';

export function appealProcessSection(templateData) {
	return {
		heading: 'Appeal process',
		items: buildRows(templateData, rowBuilders, rowKeys)
	};
}
