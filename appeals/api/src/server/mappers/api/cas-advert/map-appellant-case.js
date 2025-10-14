/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {AppellantCase|undefined}
 */
export const mapCasAdvertAppellantCase = (data) => {
	const {
		appeal: { appellantCase }
	} = data;

	return {
		highwayLand: appellantCase?.highwayLand,
		advertInPosition: appellantCase?.advertInPosition,
		landownerPermission: appellantCase?.landownerPermission,
		siteGridReferenceEasting: appellantCase?.siteGridReferenceEasting,
		siteGridReferenceNorthing: appellantCase?.siteGridReferenceNorthing
	};
};
