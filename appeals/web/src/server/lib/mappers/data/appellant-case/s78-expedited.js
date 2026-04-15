import { submaps as hasSubmaps } from './has.js';
import { mapAdvertisedAppeal } from './submappers/advertised-appeal.js';
import { mapDevelopmentType } from './submappers/development-type.js';
import { mapEiaScreening } from './submappers/eia-screening.js';
import { mapEnvironmentalStatement } from './submappers/environmental-statement.js';
import { mapInquiryNumberOfWitnesses } from './submappers/inquiry-number-of-witnesses.js';
import { mapOtherTenantsOfAgriculturalHolding } from './submappers/other-tenants-of-agricultural-holding.js';
import { mapOwnershipCertificateExpedited } from './submappers/ownership-certificate-expedited.js';
import { mapOwnershipCertificate } from './submappers/ownership-certificate.js';
import { mapPartOfAgriculturalHolding } from './submappers/part-of-agricultural-holding.js';
import { mapProcedurePreferenceDetails } from './submappers/procedure-preference-details.js';
import { mapProcedurePreferenceDuration } from './submappers/procedure-preference-duration.js';
import { mapProcedurePreference } from './submappers/procedure-preference.js';
import { mapReasonForAppeal } from './submappers/reason-for-appeal.js';
import { mapSignificantChanges } from './submappers/significant-changes.js';
import { mapTenantOfAgriculturalHolding } from './submappers/tenant-of-agricultural-holding.js';

/** @type {Record<string, import('./mapper.js').SubMapper>} */
export const submaps = {
	...hasSubmaps,
	inquiryNumberOfWitnesses: mapInquiryNumberOfWitnesses,
	procedurePreferenceDuration: mapProcedurePreferenceDuration,
	procedurePreference: mapProcedurePreference,
	advertisedAppeal: mapAdvertisedAppeal,
	ownershipCertificate: mapOwnershipCertificate,
	procedurePreferenceDetails: mapProcedurePreferenceDetails,
	developmentType: mapDevelopmentType,
	partOfAgriculturalHolding: mapPartOfAgriculturalHolding,
	tenantOfAgriculturalHolding: mapTenantOfAgriculturalHolding,
	otherTenantsOfAgriculturalHolding: mapOtherTenantsOfAgriculturalHolding,
	reasonForAppealAppellant: mapReasonForAppeal,
	anySignificantChanges: mapSignificantChanges,
	screeningOpinionIndicatesEiaRequired: mapEiaScreening,
	ownershipCertificateExpedited: mapOwnershipCertificateExpedited,
	environmentalStatement: mapEnvironmentalStatement
};
