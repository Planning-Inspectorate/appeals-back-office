import { buildRows } from '../../../build-rows.js';
import { rowKeys } from './row-keys.js';
import { rowBuilders } from './rows.js';

export function siteDetailsSection(templateData) {
	return {
		heading: 'Site details',
		items: buildRows(templateData, rowBuilders, rowKeys)
	};
}
