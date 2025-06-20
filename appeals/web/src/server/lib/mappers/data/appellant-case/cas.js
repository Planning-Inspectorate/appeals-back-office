import { mapOwnersKnown } from './submappers/owners-known.js';
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
import { mapApplicationDecision } from './submappers/application-decision.js';
import { mapChangedDevelopmentDescriptionDocument } from './submappers/changed-development-description-document.js';
import { mapLocalPlanningAuthority } from './submappers/local-planning-authority.js';
import { mapApplicationType } from './submappers/application-type.js';
import { mapInspectorAccess } from './submappers/inspector-access.js';
import { mapHealthAndSafetyIssues } from './submappers/health-and-safety-issues.js';
import { mapApplicationForm } from './submappers/application-form.js';
import { mapDecisionLetter } from './submappers/decision-letter.js';
import { mapAppealStatement } from './submappers/appeal-statement.js';
import { mapCostsDocument } from './submappers/costs-document.js';

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
	reviewOutcome: mapReviewOutcome
};
