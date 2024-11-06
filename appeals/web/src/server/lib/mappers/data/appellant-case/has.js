import { mapAdditionalDocuments } from './submappers/additional-documents.js';
import { mapInquiryNumberOfWitnesses } from './submappers/inquiry-number-of-witnesses.js';
import { mapOwnersKnown } from './submappers/owners-known.js';
import { mapProcedurePreferenceDuration } from './submappers/procedure-preference-duration.js';
import { mapProcedurePreference } from './submappers/procedure-preference.js';
import { mapRelatedAppeals } from './submappers/related-appeals.js';
import { mapReviewOutcome } from './submappers/review-outcome.js';
import { mapSiteOwnership } from './submappers/site-ownership.js';
import { mapAppellant } from './submappers/appellant.js';
import { mapAgent } from './submappers/agent.js';
import { mapApplicationReference } from './submappers/application-reference.js';
import { mapSiteAddress } from './submappers/site-address.js';
import { mapSiteArea } from './submappers/site-area.js';
import { mapInGreenBelt } from './submappers/in-green-belt.js';
import { mapApplicationDecisionDate } from './submappers/application-decision-date.js';
import { mapApplicationDate } from './submappers/application-date.js';
import { mapDevelopmentDescription } from './submappers/development-description.js';
import { mapChangedDevelopmentDescription } from './submappers/changed-development-description.js';
import { mapApplicationDecision } from './submappers/application-decision.js';
import { mapChangedDevelopmentDescriptionDocument } from './submappers/changed-development-description-document.js';
import { mapLocalPlanningAuthority } from './submappers/local-planning-authority.js';
import { mapAppealType } from './submappers/appeal-type.js';
import { mapAdvertisedAppeal } from './submappers/advertised-appeal.js';
import { mapInspectorAccess } from './submappers/inspector-access.js';
import { mapHealthAndSafetyIssues } from './submappers/health-and-safety-issues.js';
import { mapApplicationForm } from './submappers/application-form.js';
import { mapDesignAccessStatement } from './submappers/design-access-statement.js';
import { mapNewPlansDrawings } from './submappers/new-plans-drawings.js';
import { mapSupportingDocuments } from './submappers/supporting-documents.js';
import { mapPlanningObligation } from './submappers/planning-obligation.js';
import { mapOwnershipCertificateSubmitted } from './submappers/ownership-certificate-submitted.js';
import { mapOwnershipCertificate } from './submappers/ownership-certificate.js';
import { mapDecisionLetter } from './submappers/decision-letter.js';
import { mapAppealStatement } from './submappers/appeal-statement.js';
import { mapOtherNewDocuments } from './submappers/other-new-documents.js';
import { mapPlanningObligationInSupport } from './submappers/planning-obligation-in-support.js';
import { mapStatusPlanningObligation } from './submappers/status-planning-obligation.js';
import { mapPartOfAgriculturalHolding } from './submappers/part-of-agricultural-holding.js';
import { mapTenantOfAgriculturalHolding } from './submappers/tenant-of-agricultural-holding.js';
import { mapOtherTenantsOfAgriculturalHolding } from './submappers/other-tenants-of-agricultural-holding.js';
import { mapAppellantCostsApplication } from './submappers/appellant-costs-application.js';
import { mapCostsDocument } from './submappers/costs-document.js';
import { mapProcedurePreferenceDetails } from './submappers/procedure-preference-details.js';

export const submaps = {
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
	changedDevelopmentDescription: mapChangedDevelopmentDescription,
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
	ownershipCertificateSubmitted: mapOwnershipCertificateSubmitted,
	ownershipCertificate: mapOwnershipCertificate,
	decisionLetter: mapDecisionLetter,
	appealStatement: mapAppealStatement,
	otherNewDocuments: mapOtherNewDocuments,
	planningObligationInSupport: mapPlanningObligationInSupport,
	statusPlanningObligation: mapStatusPlanningObligation,
	partOfAgriculturalHolding: mapPartOfAgriculturalHolding,
	tenantOfAgriculturalHolding: mapTenantOfAgriculturalHolding,
	otherTenantsOfAgriculturalHolding: mapOtherTenantsOfAgriculturalHolding,
	appellantCostsApplication: mapAppellantCostsApplication,
	costsDocument: mapCostsDocument,
	procedurePreferenceDetails: mapProcedurePreferenceDetails
};
