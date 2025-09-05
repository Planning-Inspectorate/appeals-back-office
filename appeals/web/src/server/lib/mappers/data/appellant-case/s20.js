import { submaps as hasSubmaps } from './has.js';
import { mapAdvertisedAppeal } from './submappers/advertised-appeal.js';
import { mapDesignAccessStatement } from './submappers/design-access-statement.js';
import { mapDevelopmentType } from './submappers/development-type.js';
import { mapInquiryNumberOfWitnesses } from './submappers/inquiry-number-of-witnesses.js';
import { mapNewPlansDrawings } from './submappers/new-plans-drawings.js';
import { mapOtherNewDocuments } from './submappers/other-new-documents.js';
import { mapOwnershipCertificate } from './submappers/ownership-certificate.js';
import { mapPlanningObligation } from './submappers/planning-obligation.js';
import { mapProcedurePreferenceDetails } from './submappers/procedure-preference-details.js';
import { mapProcedurePreferenceDuration } from './submappers/procedure-preference-duration.js';
import { mapProcedurePreference } from './submappers/procedure-preference.js';
import { mapStatusPlanningObligation } from './submappers/status-planning-obligation.js';
import { mapSupportingDocuments } from './submappers/supporting-documents.js';

/** @type {Record<string, import('./mapper.js').SubMapper>} */
export const submaps = {
	...hasSubmaps,
	inquiryNumberOfWitnesses: mapInquiryNumberOfWitnesses,
	procedurePreferenceDuration: mapProcedurePreferenceDuration,
	procedurePreference: mapProcedurePreference,
	advertisedAppeal: mapAdvertisedAppeal,
	designAccessStatement: mapDesignAccessStatement,
	newPlansDrawings: mapNewPlansDrawings,
	supportingDocuments: mapSupportingDocuments,
	planningObligation: mapPlanningObligation,
	ownershipCertificate: mapOwnershipCertificate,
	otherNewDocuments: mapOtherNewDocuments,
	statusPlanningObligation: mapStatusPlanningObligation,
	procedurePreferenceDetails: mapProcedurePreferenceDetails,
	developmentType: mapDevelopmentType
};
