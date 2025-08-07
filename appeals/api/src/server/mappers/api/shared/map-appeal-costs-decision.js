/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/** @typedef {import('@pins/appeals').CostsDecision} CostsDecision */

/**
 *
 * @param {MappingRequest} data
 * @returns {CostsDecision}
 */
export const mapAppealCostsDecision = (data) => {
	// @ts-ignore
	const { awaitingAppellantCostsDecision = false, awaitingLpaCostsDecision = false } =
		data.costsDecision || {};

	return { awaitingAppellantCostsDecision, awaitingLpaCostsDecision };
};
