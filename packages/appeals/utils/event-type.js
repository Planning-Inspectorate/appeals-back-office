/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

import { PROCEDURE_TYPE_ID_MAP } from '@pins/appeals/constants/common.js';

/**
 * @param {Appeal} appeal
 * @returns
 */
export const getEventType = (appeal) => {
	let eventType = '';

	// @ts-ignore
	if (appeal.hearing && appeal.procedureType?.id === PROCEDURE_TYPE_ID_MAP.hearing) {
		eventType = 'hearing';
	} else if (appeal.siteVisit) {
		eventType = 'site visit';
	}
	return eventType;
};
