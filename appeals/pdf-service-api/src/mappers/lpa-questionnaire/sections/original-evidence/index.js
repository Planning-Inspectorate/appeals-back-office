import { buildRows } from '../../../build-rows.js';
import { rowKeys } from './row-keys.js';
import { rowBuilders } from './rows.js';

export function originalEvidenceSection(templateData) {
	const rows = buildRows(templateData, rowBuilders, rowKeys);
	if (!rows || rows.length === 0) return;

	return {
		heading: 'Original evidence',
		items: rows
	};
}
