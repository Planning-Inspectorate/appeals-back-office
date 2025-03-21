import { mapAgent } from './submappers/agent.mapper.js';
import { mapAllocationDetails } from './submappers/allocation-details.mapper.js';
import { mapAppealDecision } from './submappers/appeal-decision.mapper.js';
import { mapAppealReference } from './submappers/appeal-reference.mapper.js';
import { mapAppealStatus } from './submappers/appeal-status.mapper.js';
import { mapAppealType } from './submappers/appeal-type.mapper.js';
import { mapAppealWithdrawal } from './submappers/appeal-withdrawal.mapper.js';
import { mapAppellantCase } from './submappers/appellant-case.mapper.js';
import { mapAppellantHealthAndSafety } from './submappers/appellant-health-and-safety.mapper.js';
import { mapAppellantInspectorAccess } from './submappers/appellant-inspector-access.mapper.js';
import { mapAppellant } from './submappers/appellant.mapper.js';
import { mapCaseHistory } from './submappers/case-history.mapper.js';
import { mapCaseOfficer } from './submappers/case-officer.mapper.js';
import { mapCaseProcedure } from './submappers/case-procedure.mapper.js';
import { mapCompleteDate } from './submappers/complete-date.mapper.js';
import { mapCostsAppellantApplication } from './submappers/costs-appellant-application.mapper.js';
import { mapCostsAppellantCorrespondence } from './submappers/costs-appellant-correspondence.mapper.js';
import { mapCostsAppellantWithdrawal } from './submappers/costs-appellant-withdrawal.mapper.js';
import { mapCostsDecision } from './submappers/costs-decision.mapper.js';
import { mapCostsLpaApplication } from './submappers/costs-lpa-application.mapper.js';
import { mapCostsLpaCorrespondence } from './submappers/costs-lpa-correspondence.mapper.js';
import { mapCostsLpaWithdrawal } from './submappers/costs-lpa-withdrawal.mapper.js';
import { mapCrossTeamCorrespondence } from './submappers/cross-team-correspondence.mapper.js';
import { mapDecision } from './submappers/decision.mapper.js';
import { mapDownloadCaseFiles } from './submappers/case-files-download.mapper.js';
import { mapInspectorCorrespondence } from './submappers/inspector-correspondence.mapper.js';
import { mapInspectorNeighbouringSites } from './submappers/inspector-neighbouring-sites.mapper.js';
import { mapInspector } from './submappers/inspector.mapper.js';
import { mapIssueDeterminationDate } from './submappers/issue-determination-date.mapper.js';
import { mapLeadOrChild } from './submappers/lead-or-child.mapper.js';
import { mapLinkedAppeals } from './submappers/linked-appeals.mapper.js';
import { mapLocalPlanningAuthority } from './submappers/local-planning-authority.mapper.js';
import { mapLpaContactDetails } from './submappers/lpa-contact-details.mapper.js';
import { mapLpaHealthAndSafety } from './submappers/lpa-health-and-safety.mapper.js';
import { mapLpaInspectorAccess } from './submappers/lpa-inspector-access.mapper.js';
import { mapLpaNeighbouringSites } from './submappers/lpa-neighbouring-sites.mapper.js';
import { mapLpaQuestionnaireDueDate } from './submappers/lpa-questionnaire-due-date.mapper.js';
import { mapLpaQuestionnaire } from './submappers/lpa-questionnaire.mapper.js';
import { mapLpaReference } from './submappers/lpa-reference.mapper.js';
import { mapOtherAppeals } from './submappers/other-appeals.mapper.js';
import { mapSiteAddress } from './submappers/site-address.mapper.js';
import { mapSiteVisitDate } from './submappers/site-visit-date.mapper.js';
import { mapStartedAt } from './submappers/started-at.mapper.js';
import { mapValidAt } from './submappers/valid-at.mapper.js';
import { mapVisitType } from './submappers/visit-type.mapper.js';

/** @type {Record<string, import('./mapper.js').SubMapper>} */
export const submaps = {
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
	lpaContactDetails: mapLpaContactDetails,
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
