/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { currentStatus } from '#utils/current-status.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {string}
 */
export const mapAppealStatus = (data) => {
	const { appeal } = data;

	if (!appeal.appealStatus || !appeal.appealStatus.length) {
		return '';
	}

	if (appeal.appealStatus.length > 1) {
		return currentStatus(appeal);
	}

	return appeal.appealStatus[0].status;
};
