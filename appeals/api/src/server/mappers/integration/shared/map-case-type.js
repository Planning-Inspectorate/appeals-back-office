/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 * @param {MappingRequest} data
 * @returns {{ caseType: string|null }}
 */
export const mapCaseType = (data) => {
	const { appeal } = data;

	const type = appeal?.appealType?.key;
	return {
		caseType: type ?? null
	};
};
