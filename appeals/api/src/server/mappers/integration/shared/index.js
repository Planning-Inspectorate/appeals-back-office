import { mapAppellantCase } from './map-appellant-case.js';
import { mapCaseAddresses } from './map-case-addresses.js';
import { mapCaseAllocation } from './map-case-allocation.js';
import { mapCaseDates } from './map-case-dates.js';
import { mapCaseOutcome } from './map-case-outcome.js';
import { mapCaseRelationships } from './map-case-relationships.js';
import { mapCaseStatus } from './map-case-status.js';
import { mapCaseSummary } from './map-case-summary.js';
import { mapCaseType } from './map-case-type.js';
import { mapCaseValidation } from './map-case-validation.js';
import { mapQuestionnaireValidation } from './map-lpa-questionnaire-validation.js';
import { mapLpaQuestionnaire } from './map-lpa-questionnaire.js';
import { mapCaseTeam } from './map-team.js';

export const integrationSharedMappers = {
	caseAddresses: mapCaseAddresses,
	caseAllocation: mapCaseAllocation,
	caseDates: mapCaseDates,
	caseOutcome: mapCaseOutcome,
	caseRelationships: mapCaseRelationships,
	caseStatus: mapCaseStatus,
	caseSummary: mapCaseSummary,
	caseType: mapCaseType,
	caseTeam: mapCaseTeam,
	caseValidation: mapCaseValidation,
	appellantCase: mapAppellantCase,
	lpaQuestionnaire: mapLpaQuestionnaire,
	questionnareValidation: mapQuestionnaireValidation
};
