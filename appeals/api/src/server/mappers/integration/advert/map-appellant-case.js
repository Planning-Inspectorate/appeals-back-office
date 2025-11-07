/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { mapAppellantCaseSharedFields } from '#mappers/integration/shared/s20s78/map-appellant-case.js';

/**
 *
 * @param {MappingRequest} data
 */
export const mapAppellantCase = (data) => {
	const { appeal } = data;

	const casedata = appeal.appellantCase;

	return {
		...mapAppellantCaseSharedFields(data),
		advertDetails: casedata?.appellantCaseAdvertDetails?.map((advert) => ({
			advertType: null,
			isAdvertInPosition: advert.advertInPosition ?? null,
			isSiteOnHighwayLand: advert.highwayLand ?? null
		})),
		hasLandownersPermission: casedata?.landownerPermission ?? null,
		// required fields, but not used in adverts
		informedTenantsAgriculturalHolding: null,
		agriculturalHolding: null,
		tenantAgriculturalHolding: null,
		otherTenantsAgriculturalHolding: null
	};
};
