/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {{appeal: { procedureType?: { name?: string } | null }}} data
 * @returns {string}
 */
export const mapProcedureType = (data) => {
	const { appeal } = data;

	return appeal.procedureType?.name || 'Written';
};
