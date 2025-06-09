/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('pins-data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { mapAppellantCaseSharedFields } from '../shared/s20s78/map-appellant-case.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {AppealS78Case}
 */
export const mapAppellantCase = (data) => {
	const { appeal } = data;

	const casedata = appeal.appellantCase;

	// @ts-ignore
	return {
		...mapAppellantCaseSharedFields(data),
		informedTenantsAgriculturalHolding: casedata?.informedTenantsAgriculturalHolding ?? null,
		agriculturalHolding: casedata?.agriculturalHolding ?? null,
		tenantAgriculturalHolding: casedata?.tenantAgriculturalHolding ?? null,
		otherTenantsAgriculturalHolding: casedata?.otherTenantsAgriculturalHolding ?? null
	};
};
