import { submaps as s20SubMaps } from './s20.js';
import { mapOtherTenantsOfAgriculturalHolding } from './submappers/other-tenants-of-agricultural-holding.js';
import { mapPartOfAgriculturalHolding } from './submappers/part-of-agricultural-holding.js';
import { mapTenantOfAgriculturalHolding } from './submappers/tenant-of-agricultural-holding.js';

/** @type {Record<string, import('./mapper.js').SubMapper>} */
export const submaps = {
	...s20SubMaps,
	partOfAgriculturalHolding: mapPartOfAgriculturalHolding,
	tenantOfAgriculturalHolding: mapTenantOfAgriculturalHolding,
	otherTenantsOfAgriculturalHolding: mapOtherTenantsOfAgriculturalHolding
};
