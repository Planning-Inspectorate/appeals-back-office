/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { mapS20AppellantCase } from '../s20/map-appellant-case.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {AppellantCase|undefined}
 */
export const mapS78AppellantCase = (data) => {
	const {
		appeal: { appellantCase }
	} = data;

	const sharedS20Mappers = mapS20AppellantCase(data);

	return {
		...sharedS20Mappers,
		agriculturalHolding: {
			isPartOfAgriculturalHolding: appellantCase?.agriculturalHolding,
			isTenant: appellantCase?.tenantAgriculturalHolding,
			hasOtherTenants: appellantCase?.otherTenantsAgriculturalHolding
		}
	};
};
