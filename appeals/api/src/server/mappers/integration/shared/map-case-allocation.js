/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 * @param {MappingRequest} data
 * @returns {{ allocationLevel: string|null, allocationBand: number|null, caseSpecialisms: string[]|null }}
 */
export const mapCaseAllocation = (data) => {
	const { appeal } = data;
	if (appeal.allocation) {
		return {
			allocationLevel: appeal.allocation.level,
			allocationBand: appeal.allocation.band,
			caseSpecialisms: appeal.specialisms?.map((s) => s.specialism?.name) || []
		};
	}

	return {
		allocationLevel: null,
		allocationBand: null,
		caseSpecialisms: null
	};
};
