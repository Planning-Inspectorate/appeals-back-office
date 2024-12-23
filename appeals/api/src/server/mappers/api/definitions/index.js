import { Allocation } from './allocation.js';
import { NeighbouringSite } from './neighbouring-site.js';
import { Timetable } from './timetable.js';
import { TransferStatus } from './transfer-status.js';
import { Team } from './team.js';
import { Appeal } from './appeal.js';
import { AppealSummary } from './appeal-summary.js';
import { DocumentationSummary } from './documentation-summary.js';
import { AppealDecision } from './appeal-decision.js';
import { AppealRelationship } from './appeal-relationship.js';
import { AppealWithdrawal } from './appeal-withdrawal.js';
import { AppellantCase } from './appellant-case.js';
import { LpaQuestionnaire } from './lpa-questionnaire.js';
import { SiteSafety } from './site-safety.js';
import { SiteAccess } from './site-access.js';
import { SiteVisit } from './site-visit.js';
import { ServiceUser } from './service-user.js';
import { Folder, Document, DocumentVersion, DocumentLog } from './folders-documents.js';

const partials = {
	Allocation,
	NeighbouringSite,
	Timetable,
	TransferStatus,
	Team,
	AppealSummary,
	DocumentationSummary,
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
	ServiceUser
};

export const ApiDefinitions = {
	...partials,
	Appeal
};
