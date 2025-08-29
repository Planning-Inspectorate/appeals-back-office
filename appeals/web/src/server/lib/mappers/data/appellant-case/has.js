import { mapAdditionalDocuments } from './submappers/additional-documents.js';
import { mapAgent } from './submappers/agent.js';
import { mapAppealStatement } from './submappers/appeal-statement.js';
import { mapAppellant } from './submappers/appellant.js';
import { mapApplicationDate } from './submappers/application-date.js';
import { mapApplicationDecisionDate } from './submappers/application-decision-date.js';
import { mapApplicationDecision } from './submappers/application-decision.js';
import { mapApplicationForm } from './submappers/application-form.js';
import { mapApplicationReference } from './submappers/application-reference.js';
import { mapApplicationType } from './submappers/application-type.js';
import { mapChangedDevelopmentDescriptionDocument } from './submappers/changed-development-description-document.js';
import { mapCostsDocument } from './submappers/costs-document.js';
import { mapDecisionLetter } from './submappers/decision-letter.js';
import { mapDevelopmentDescription } from './submappers/development-description.js';
import { mapHealthAndSafetyIssues } from './submappers/health-and-safety-issues.js';
import { mapInGreenBelt } from './submappers/in-green-belt.js';
import { mapInspectorAccess } from './submappers/inspector-access.js';
import { mapLocalPlanningAuthority } from './submappers/local-planning-authority.js';
import { mapOwnersKnown } from './submappers/owners-known.js';
import { mapRelatedAppeals } from './submappers/related-appeals.js';
import { mapReviewOutcome } from './submappers/review-outcome.js';
import { mapSiteAddress } from './submappers/site-address.js';
import { mapSiteArea } from './submappers/site-area.js';
import { mapSiteOwnership } from './submappers/site-ownership.js';
import { mapStatementCommonGroundDocument } from './submappers/statement-common-ground.js';

export const submaps = {
	appellant: mapAppellant,
	agent: mapAgent,
	siteAddress: mapSiteAddress,
	siteArea: mapSiteArea,
	inGreenBelt: mapInGreenBelt,
	siteOwnership: mapSiteOwnership,
	ownersKnown: mapOwnersKnown,
	inspectorAccess: mapInspectorAccess,
	healthAndSafetyIssues: mapHealthAndSafetyIssues,
	localPlanningAuthority: mapLocalPlanningAuthority,
	applicationReference: mapApplicationReference,
	applicationDate: mapApplicationDate,
	applicationForm: mapApplicationForm,
	developmentDescription: mapDevelopmentDescription,
	changedDevelopmentDescriptionDocument: mapChangedDevelopmentDescriptionDocument,
	applicationDecisionDate: mapApplicationDecisionDate,
	decisionLetter: mapDecisionLetter,
	applicationDecision: mapApplicationDecision,
	applicationType: mapApplicationType,
	appealStatement: mapAppealStatement,
	costsDocument: mapCostsDocument,
	additionalDocuments: mapAdditionalDocuments,
	reviewOutcome: mapReviewOutcome,
	relatedAppeals: mapRelatedAppeals,
	statementCommonGround: mapStatementCommonGroundDocument
};
