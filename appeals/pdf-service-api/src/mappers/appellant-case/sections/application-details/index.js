import { buildRows } from '../../../build-rows.js';
import { rowKeys } from './row-keys.js';
import { rowBuilders } from './rows.js';

export function applicationDetailsSection(templateData) {
	return {
		heading: 'Application details',
		items: buildRows(templateData, rowBuilders, rowKeys)
	};
}
