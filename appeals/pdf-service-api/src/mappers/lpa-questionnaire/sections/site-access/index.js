import { buildRows } from '../build-rows.js';
import { rowKeys } from './row-keys.js';
import { rowBuilders } from './rows.js';

export function siteAccessSection(templateData) {
	return {
		heading: 'Site access',
		items: buildRows(templateData, rowBuilders, rowKeys)
	};
}
