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

	const advertDetails = appellantCase?.appellantCaseAdvertDetails;

	return {
		highwayLand: advertDetails?.[0]?.highwayLand,
		advertInPosition: advertDetails?.[0]?.advertInPosition,
		landownerPermission: appellantCase?.landownerPermission,
		siteGridReferenceEasting: appellantCase?.siteGridReferenceEasting,
		siteGridReferenceNorthing: appellantCase?.siteGridReferenceNorthing
	};
};
