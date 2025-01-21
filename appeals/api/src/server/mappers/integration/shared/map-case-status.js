/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 * @param {MappingRequest} data
 * @returns {{ caseStatus: string|null }}
 */
export const mapCaseStatus = (data) => {
	const { appeal } = data;

	const validStatus = appeal?.appealStatus?.find((status) => status.valid === true);
	return {
		caseStatus: validStatus?.status ?? null
	};
};
