/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 * @param {MappingRequest} data
 */
export const mapCaseAttributes = (data) => {
	const { appeal } = data;

	return {
		enforcementNoticeReference: appeal.appellantCase?.enforcementReference ?? null
	};
};
