/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.Allocation} Allocation */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/**
 *
 * @param {MappingRequest} data
 * @returns {Allocation|undefined}
 */
export const mapAllocationDetails = (data) => {
	const { appeal } = data;

	if (appeal.allocation)
		return {
			level: appeal.allocation.level,
			band: appeal.allocation.band,
			specialisms: appeal.specialisms?.map((s) => s.specialism?.name) || []
		};
};
