/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/** @typedef {import('@pins/appeals.api').Appeals.StateStub} StateStub */

/**
 *
 * @param {MappingRequest} data
 * @returns {string[]}
 */
export function mapCompletedStateList(data) {
	return data.appeal.appealStatus?.filter(({ valid }) => !valid).map(({ status }) => status) || [];
}
