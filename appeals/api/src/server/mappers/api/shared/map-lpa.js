/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {string}
 */
export const mapLpa = (data) => {
	const { appeal } = data;

	return appeal.lpa?.name || '';
};

/**
 *
 * @param {MappingRequest} data
 * @returns {string}
 */
export const mapLpaCode = (data) => {
	const { appeal } = data;

	return appeal.lpa?.lpaCode || '';
};
