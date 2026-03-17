import { buildRows } from '../../../build-rows.js';
import { rowKeys } from './row-keys.js';
import { rowBuilders } from './rows.js';

export function uploadDocumentsSection(templateData) {
	return {
		heading: 'Upload documents',
		items: buildRows(templateData, rowBuilders, rowKeys)
	};
}
