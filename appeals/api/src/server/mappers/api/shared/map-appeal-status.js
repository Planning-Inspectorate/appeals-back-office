/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

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
		return appeal.appealStatus.find((status) => status.valid === true)?.status || '';
	}

	return appeal.appealStatus[0].status;
};
