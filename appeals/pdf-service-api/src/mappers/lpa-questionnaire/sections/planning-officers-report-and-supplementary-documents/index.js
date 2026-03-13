import { buildRows } from '../../../build-rows.js';
import { rowKeys } from './row-keys.js';
import { rowBuilders } from './rows.js';

export function planningOfficersReportAndSupplementaryDocumentsSection(templateData) {
	return {
		heading: 'Planning officer’s report and supplementary documents',
		items: buildRows(templateData, rowBuilders, rowKeys)
	};
}
