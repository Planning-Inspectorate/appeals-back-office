/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {string}
 */
export const mapApplicationReference = (data) => {
	const { appeal } = data;

	return appeal.applicationReference || '';
};
