/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('pins-data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { mapAppellantCaseSharedFields } from '#mappers/integration/shared/s20s78/map-appellant-case.js';

/**
 *
 * @param {MappingRequest} data
 */
export const mapAppellantCase = (data) => {
	return {
		...mapAppellantCaseSharedFields(data),
		informedTenantsAgriculturalHolding: null,
		agriculturalHolding: null,
		tenantAgriculturalHolding: null,
		otherTenantsAgriculturalHolding: null
	};
};
