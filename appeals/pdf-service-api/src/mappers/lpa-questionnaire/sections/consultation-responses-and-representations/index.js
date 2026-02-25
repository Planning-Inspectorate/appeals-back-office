import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { buildRows } from '../build-rows.js';
import { rowKeys } from './row-keys.js';
import { rowBuilders } from './rows.js';

export function consultationResponsesAndRepresentationsSection(templateData) {
	if (templateData.appealType === APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE) return;

	return {
		heading: 'Consultation responses and representations',
		items: buildRows(templateData, rowBuilders, rowKeys)
	};
}
