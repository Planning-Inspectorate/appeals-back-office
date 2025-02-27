import { mapAgent } from './row-mappers/agent.mapper.js';
import { mapAllocationDetails } from './row-mappers/allocation-details.mapper.js';
import { mapAppealDecision } from './row-mappers/appeal-decision.mapper.js';
import { mapAppealReference } from './row-mappers/appeal-reference.mapper.js';
import { mapAppealStatus } from './row-mappers/appeal-status.mapper.js';
import { mapAppealType } from './row-mappers/appeal-type.mapper.js';
import { mapAppealWithdrawal } from './row-mappers/appeal-withdrawal.mapper.js';
import { mapAppellantCase } from './row-mappers/appellant-case.mapper.js';
import { mapAppellantHealthAndSafety } from './row-mappers/appellant-health-and-safety.mapper.js';
import { mapAppellantInspectorAccess } from './row-mappers/appellant-inspector-access.mapper.js';
import { mapAppellant } from './row-mappers/appellant.mapper.js';
import { mapCaseHistory } from './row-mappers/case-history.mapper.js';
import { mapCaseOfficer } from './row-mappers/case-officer.mapper.js';
import { mapCaseProcedure } from './row-mappers/case-procedure.mapper.js';
import { mapCompleteDate } from './row-mappers/complete-date.mapper.js';
import { mapCostsAppellantApplication } from './row-mappers/costs-appellant-application.mapper.js';
import { mapCostsAppellantCorrespondence } from './row-mappers/costs-appellant-correspondence.mapper.js';
import { mapCostsAppellantWithdrawal } from './row-mappers/costs-appellant-withdrawal.mapper.js';
import { mapCostsDecision } from './row-mappers/costs-decision.mapper.js';
import { mapCostsLpaApplication } from './row-mappers/costs-lpa-application.mapper.js';
import { mapCostsLpaCorrespondence } from './row-mappers/costs-lpa-correspondence.mapper.js';
import { mapCostsLpaWithdrawal } from './row-mappers/costs-lpa-withdrawal.mapper.js';
import { mapCrossTeamCorrespondence } from './row-mappers/cross-team-correspondence.mapper.js';
import { mapDecision } from './row-mappers/decision.mapper.js';
import { mapDownloadCaseFiles } from './row-mappers/case-files-download.mapper.js';
import { mapInspectorCorrespondence } from './row-mappers/inspector-correspondence.mapper.js';
import { mapInspectorNeighbouringSites } from './row-mappers/inspector-neighbouring-sites.mapper.js';
import { mapInspector } from './row-mappers/inspector.mapper.js';
import { mapIssueDeterminationDate } from './row-mappers/issue-determination-date.mapper.js';
import { mapLeadOrChild } from './row-mappers/lead-or-child.mapper.js';
import { mapLinkedAppeals } from './row-mappers/linked-appeals.mapper.js';
import { mapLocalPlanningAuthority } from './row-mappers/local-planning-authority.mapper.js';
import { mapLpaHealthAndSafety } from './row-mappers/lpa-health-and-safety.mapper.js';
import { mapLpaInspectorAccess } from './row-mappers/lpa-inspector-access.mapper.js';
import { mapLpaNeighbouringSites } from './row-mappers/lpa-neighbouring-sites.mapper.js';
import { mapLpaQuestionnaireDueDate } from './row-mappers/lpa-questionnaire-due-date.mapper.js';
import { mapLpaQuestionnaire } from './row-mappers/lpa-questionnaire.mapper.js';
import { mapLpaReference } from './row-mappers/lpa-reference.mapper.js';
import { mapOtherAppeals } from './row-mappers/other-appeals.mapper.js';
import { mapSiteAddress } from './row-mappers/site-address.mapper.js';
import { mapSiteVisitDate } from './row-mappers/site-visit-date.mapper.js';
import { mapStartedAt } from './row-mappers/started-at.mapper.js';
import { mapValidAt } from './row-mappers/valid-at.mapper.js';
import { mapVisitType } from './row-mappers/visit-type.mapper.js';

/** @type {Record<string, import('./mapper.js').RowMapper>} */
export const hasRowMappers = {
	appealReference: mapAppealReference,
	appealType: mapAppealType,
	caseProcedure: mapCaseProcedure,
	appellant: mapAppellant,
	agent: mapAgent,
	linkedAppeals: mapLinkedAppeals,
	leadOrChild: mapLeadOrChild,
	otherAppeals: mapOtherAppeals,
	allocationDetails: mapAllocationDetails,
	lpaReference: mapLpaReference,
	decision: mapDecision,
	siteAddress: mapSiteAddress,
	localPlanningAuthority: mapLocalPlanningAuthority,
	appealStatus: mapAppealStatus,
	lpaInspectorAccess: mapLpaInspectorAccess,
	appellantInspectorAccess: mapAppellantInspectorAccess,
	lpaNeighbouringSites: mapLpaNeighbouringSites,
	inspectorNeighbouringSites: mapInspectorNeighbouringSites,
	lpaHealthAndSafety: mapLpaHealthAndSafety,
	appellantHealthAndSafety: mapAppellantHealthAndSafety,
	visitType: mapVisitType,
	validAt: mapValidAt,
	startedAt: mapStartedAt,
	lpaQuestionnaireDueDate: mapLpaQuestionnaireDueDate,
	siteVisitDate: mapSiteVisitDate,
	caseOfficer: mapCaseOfficer,
	inspector: mapInspector,
	crossTeamCorrespondence: mapCrossTeamCorrespondence,
	inspectorCorrespondence: mapInspectorCorrespondence,
	caseHistory: mapCaseHistory,
	appealWithdrawal: mapAppealWithdrawal,
	appellantCase: mapAppellantCase,
	lpaQuestionnaire: mapLpaQuestionnaire,
	appealDecision: mapAppealDecision,
	costsAppellantApplication: mapCostsAppellantApplication,
	costsAppellantWithdrawal: mapCostsAppellantWithdrawal,
	costsAppellantCorrespondence: mapCostsAppellantCorrespondence,
	costsLpaApplication: mapCostsLpaApplication,
	costsLpaWithdrawal: mapCostsLpaWithdrawal,
	costsLpaCorrespondence: mapCostsLpaCorrespondence,
	costsDecision: mapCostsDecision,
	issueDeterminationDate: mapIssueDeterminationDate,
	completeDate: mapCompleteDate,
	downloadCaseFiles: mapDownloadCaseFiles
};
