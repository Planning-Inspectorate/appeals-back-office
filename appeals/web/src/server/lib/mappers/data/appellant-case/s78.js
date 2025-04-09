import { submaps as hasSubmaps } from './has.js';
import { mapInquiryNumberOfWitnesses } from './submappers/inquiry-number-of-witnesses.js';
import { mapAdvertisedAppeal } from './submappers/advertised-appeal.js';
import { mapProcedurePreferenceDuration } from './submappers/procedure-preference-duration.js';
import { mapProcedurePreference } from './submappers/procedure-preference.js';
import { mapRelatedAppeals } from './submappers/related-appeals.js';
import { mapDesignAccessStatement } from './submappers/design-access-statement.js';
import { mapNewPlansDrawings } from './submappers/new-plans-drawings.js';
import { mapSupportingDocuments } from './submappers/supporting-documents.js';
import { mapPlanningObligation } from './submappers/planning-obligation.js';
import { mapOwnershipCertificate } from './submappers/ownership-certificate.js';
import { mapProcedurePreferenceDetails } from './submappers/procedure-preference-details.js';
import { mapOtherNewDocuments } from './submappers/other-new-documents.js';
import { mapStatusPlanningObligation } from './submappers/status-planning-obligation.js';
import { mapPartOfAgriculturalHolding } from './submappers/part-of-agricultural-holding.js';
import { mapTenantOfAgriculturalHolding } from './submappers/tenant-of-agricultural-holding.js';
import { mapOtherTenantsOfAgriculturalHolding } from './submappers/other-tenants-of-agricultural-holding.js';
import { mapDevelopmentType } from './submappers/development-type.js';

/** @type {Record<string, import('./mapper.js').SubMapper>} */
export const submaps = {
	...hasSubmaps,
	inquiryNumberOfWitnesses: mapInquiryNumberOfWitnesses,
	procedurePreferenceDuration: mapProcedurePreferenceDuration,
	procedurePreference: mapProcedurePreference,
	relatedAppeals: mapRelatedAppeals,
	advertisedAppeal: mapAdvertisedAppeal,
	designAccessStatement: mapDesignAccessStatement,
	newPlansDrawings: mapNewPlansDrawings,
	supportingDocuments: mapSupportingDocuments,
	planningObligation: mapPlanningObligation,
	ownershipCertificate: mapOwnershipCertificate,
	otherNewDocuments: mapOtherNewDocuments,
	statusPlanningObligation: mapStatusPlanningObligation,
	partOfAgriculturalHolding: mapPartOfAgriculturalHolding,
	tenantOfAgriculturalHolding: mapTenantOfAgriculturalHolding,
	otherTenantsOfAgriculturalHolding: mapOtherTenantsOfAgriculturalHolding,
	procedurePreferenceDetails: mapProcedurePreferenceDetails,
	developmentType: mapDevelopmentType
};
