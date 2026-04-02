import { submaps as s20SubMaps } from './s20.js';
import { mapEiaScreening } from './submappers/eia-screening.js';
import { mapOtherTenantsOfAgriculturalHolding } from './submappers/other-tenants-of-agricultural-holding.js';
import { mapOwnershipCertificateExpedited } from './submappers/ownership-certificate-expedited.js';
import { mapPartOfAgriculturalHolding } from './submappers/part-of-agricultural-holding.js';
import { mapReasonForAppeal } from './submappers/reason-for-appeal.js';
import { mapSignificantChanges } from './submappers/significant-changes.js';
import { mapTenantOfAgriculturalHolding } from './submappers/tenant-of-agricultural-holding.js';

/** @type {Record<string, import('./mapper.js').SubMapper>} */
export const submaps = {
	...s20SubMaps,
	partOfAgriculturalHolding: mapPartOfAgriculturalHolding,
	tenantOfAgriculturalHolding: mapTenantOfAgriculturalHolding,
	otherTenantsOfAgriculturalHolding: mapOtherTenantsOfAgriculturalHolding,
	reasonForAppealAppellant: mapReasonForAppeal,
	anySignificantChanges: mapSignificantChanges,
	screeningOpinionIndicatesEiaRequired: mapEiaScreening,
	ownershipCertificateExpedited: mapOwnershipCertificateExpedited
};
