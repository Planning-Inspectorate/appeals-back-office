import { Allocation } from './allocation.js';
import { Address } from './address.js';
import { NeighbouringSite } from './neighbouring-site.js';
import { Timetable } from './timetable.js';
import { TransferStatus } from './transfer-status.js';
import { Team } from './team.js';
import { Appeal } from './appeal.js';
import { AppealSummary } from './appeal-summary.js';
import { DocumentationSummary } from './documentation-summary.js';
import { StateList } from './state-list.js';
import { AppealDecision } from './appeal-decision.js';
import { AppealRelationship } from './appeal-relationship.js';
import { AppealWithdrawal } from './appeal-withdrawal.js';
import { AppellantCase, AppellantCaseUpdateRequest } from './appellant-case.js';
import { LpaQuestionnaire, LpaQuestionnaireUpdateRequest } from './lpa-questionnaire.js';
import { SiteSafety } from './site-safety.js';
import { SiteAccess } from './site-access.js';
import { SiteVisit } from './site-visit.js';
import { ServiceUser } from './service-user.js';
import { Folder, Document, DocumentVersion, DocumentLog } from './folders-documents.js';
import { InvalidIncompleteReason } from './invalid-incomplete.js';
import { ListedBuilding } from './listed-building.js';
import { DesignatedSiteName } from './designated-site-name.js';
import { Notifications } from './notification.js';
import { AuditNotifications } from './audit-notification.js';
import { AssignedTeam } from './assigned-team.js';

const partials = {
	Address,
	Allocation,
	NeighbouringSite,
	Timetable,
	TransferStatus,
	AssignedTeam,
	Team,
	AppealSummary,
	DocumentationSummary,
	StateList,
	AppealDecision,
	AppealWithdrawal,
	AppealRelationship,
	Folder,
	Document,
	DocumentVersion,
	DocumentLog,
	SiteVisit,
	SiteSafety,
	SiteAccess,
	AppellantCase,
	LpaQuestionnaire,
	ServiceUser,
	InvalidIncompleteReason,
	ListedBuilding,
	DesignatedSiteName
};

export const ApiDefinitions = {
	...partials,
	Appeal,
	AppellantCaseUpdateRequest,
	LpaQuestionnaireUpdateRequest,
	Notifications,
	AuditNotifications
};
