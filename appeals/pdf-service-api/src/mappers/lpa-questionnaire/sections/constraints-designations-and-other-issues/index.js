import { buildRows } from '../build-rows.js';
import { rowKeys } from './row-keys.js';
import { rowBuilders } from './rows.js';

export function constraintsDesignationsAndOtherIssuesSection(templateData) {
	return {
		heading: 'Constraints, designations and other issues',
		items: buildRows(templateData, rowBuilders, rowKeys)
	};
}
