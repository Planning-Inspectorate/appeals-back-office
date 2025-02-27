import { mapAdditionalDocuments } from '#lib/mappers/data/appellant-case/row-mappers/additional-documents.js';
import { mapInquiryNumberOfWitnesses } from '#lib/mappers/data/appellant-case/row-mappers/inquiry-number-of-witnesses.js';
import { mapOwnersKnown } from '#lib/mappers/data/appellant-case/row-mappers/owners-known.js';
import { mapProcedurePreferenceDuration } from '#lib/mappers/data/appellant-case/row-mappers/procedure-preference-duration.js';
import { mapProcedurePreference } from '#lib/mappers/data/appellant-case/row-mappers/procedure-preference.js';
import { mapRelatedAppeals } from '#lib/mappers/data/appellant-case/row-mappers/related-appeals.js';
import { mapReviewOutcome } from '#lib/mappers/data/appellant-case/row-mappers/review-outcome.js';
import { mapSiteOwnership } from '#lib/mappers/data/appellant-case/row-mappers/site-ownership.js';
import { mapAppellant } from '#lib/mappers/data/appellant-case/row-mappers/appellant.js';
import { mapAgent } from '#lib/mappers/data/appellant-case/row-mappers/agent.js';
import { mapApplicationReference } from '#lib/mappers/data/appellant-case/row-mappers/application-reference.js';
import { mapSiteAddress } from '#lib/mappers/data/appellant-case/row-mappers/site-address.js';
import { mapSiteArea } from '#lib/mappers/data/appellant-case/row-mappers/site-area.js';
import { mapInGreenBelt } from '#lib/mappers/data/appellant-case/row-mappers/in-green-belt.js';
import { mapApplicationDecisionDate } from '#lib/mappers/data/appellant-case/row-mappers/application-decision-date.js';
import { mapApplicationDate } from '#lib/mappers/data/appellant-case/row-mappers/application-date.js';
import { mapDevelopmentDescription } from '#lib/mappers/data/appellant-case/row-mappers/development-description.js';
import { mapApplicationDecision } from '#lib/mappers/data/appellant-case/row-mappers/application-decision.js';
import { mapChangedDevelopmentDescriptionDocument } from '#lib/mappers/data/appellant-case/row-mappers/changed-development-description-document.js';
import { mapLocalPlanningAuthority } from '#lib/mappers/data/appellant-case/row-mappers/local-planning-authority.js';
import { mapAppealType } from '#lib/mappers/data/appellant-case/row-mappers/appeal-type.js';
import { mapAdvertisedAppeal } from '#lib/mappers/data/appellant-case/row-mappers/advertised-appeal.js';
import { mapInspectorAccess } from '#lib/mappers/data/appellant-case/row-mappers/inspector-access.js';
import { mapHealthAndSafetyIssues } from '#lib/mappers/data/appellant-case/row-mappers/health-and-safety-issues.js';
import { mapApplicationForm } from '#lib/mappers/data/appellant-case/row-mappers/application-form.js';
import { mapDesignAccessStatement } from '#lib/mappers/data/appellant-case/row-mappers/design-access-statement.js';
import { mapNewPlansDrawings } from '#lib/mappers/data/appellant-case/row-mappers/new-plans-drawings.js';
import { mapSupportingDocuments } from '#lib/mappers/data/appellant-case/row-mappers/supporting-documents.js';
import { mapPlanningObligation } from '#lib/mappers/data/appellant-case/row-mappers/planning-obligation.js';
import { mapOwnershipCertificate } from '#lib/mappers/data/appellant-case/row-mappers/ownership-certificate.js';
import { mapDecisionLetter } from '#lib/mappers/data/appellant-case/row-mappers/decision-letter.js';
import { mapAppealStatement } from '#lib/mappers/data/appellant-case/row-mappers/appeal-statement.js';
import { mapOtherNewDocuments } from '#lib/mappers/data/appellant-case/row-mappers/other-new-documents.js';
import { mapStatusPlanningObligation } from '#lib/mappers/data/appellant-case/row-mappers/status-planning-obligation.js';
import { mapPartOfAgriculturalHolding } from '#lib/mappers/data/appellant-case/row-mappers/part-of-agricultural-holding.js';
import { mapTenantOfAgriculturalHolding } from '#lib/mappers/data/appellant-case/row-mappers/tenant-of-agricultural-holding.js';
import { mapOtherTenantsOfAgriculturalHolding } from '#lib/mappers/data/appellant-case/row-mappers/other-tenants-of-agricultural-holding.js';
import { mapCostsDocument } from '#lib/mappers/data/appellant-case/row-mappers/costs-document.js';
import { mapProcedurePreferenceDetails } from '#lib/mappers/data/appellant-case/row-mappers/procedure-preference-details.js';

export const hasRowMaps = {
	additionalDocuments: mapAdditionalDocuments,
	inquiryNumberOfWitnesses: mapInquiryNumberOfWitnesses,
	ownersKnown: mapOwnersKnown,
	procedurePreferenceDuration: mapProcedurePreferenceDuration,
	procedurePreference: mapProcedurePreference,
	relatedAppeals: mapRelatedAppeals,
	reviewOutcome: mapReviewOutcome,
	siteOwnership: mapSiteOwnership,
	appellant: mapAppellant,
	agent: mapAgent,
	applicationReference: mapApplicationReference,
	siteAddress: mapSiteAddress,
	siteArea: mapSiteArea,
	inGreenBelt: mapInGreenBelt,
	applicationDecisionDate: mapApplicationDecisionDate,
	applicationDate: mapApplicationDate,
	developmentDescription: mapDevelopmentDescription,
	applicationDecision: mapApplicationDecision,
	changedDevelopmentDescriptionDocument: mapChangedDevelopmentDescriptionDocument,
	localPlanningAuthority: mapLocalPlanningAuthority,
	appealType: mapAppealType,
	advertisedAppeal: mapAdvertisedAppeal,
	inspectorAccess: mapInspectorAccess,
	healthAndSafetyIssues: mapHealthAndSafetyIssues,
	applicationForm: mapApplicationForm,
	designAccessStatement: mapDesignAccessStatement,
	newPlansDrawings: mapNewPlansDrawings,
	supportingDocuments: mapSupportingDocuments,
	planningObligation: mapPlanningObligation,
	ownershipCertificate: mapOwnershipCertificate,
	decisionLetter: mapDecisionLetter,
	appealStatement: mapAppealStatement,
	otherNewDocuments: mapOtherNewDocuments,
	statusPlanningObligation: mapStatusPlanningObligation,
	partOfAgriculturalHolding: mapPartOfAgriculturalHolding,
	tenantOfAgriculturalHolding: mapTenantOfAgriculturalHolding,
	otherTenantsOfAgriculturalHolding: mapOtherTenantsOfAgriculturalHolding,
	costsDocument: mapCostsDocument,
	procedurePreferenceDetails: mapProcedurePreferenceDetails
};
