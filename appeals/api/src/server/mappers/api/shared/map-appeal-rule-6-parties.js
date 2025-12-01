/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 */
export const mapAppealRule6Parties = (data) => {
	const { appeal } = data;

	if (appeal.appealRule6Parties) {
		return appeal.appealRule6Parties;
	}
};
