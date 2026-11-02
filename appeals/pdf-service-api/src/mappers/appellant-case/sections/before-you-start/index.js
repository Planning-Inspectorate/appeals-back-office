import { buildRows } from '../../../build-rows.js';
import { rowKeys } from './row-keys.js';
import { rowBuilders } from './rows.js';

export function beforeYouStartSection(templateData) {
	return {
		heading: 'Before you start',
		items: buildRows(templateData, rowBuilders, rowKeys)
	};
}
