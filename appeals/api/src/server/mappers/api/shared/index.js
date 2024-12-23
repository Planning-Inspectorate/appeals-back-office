import { mapAppealSummary } from './map-appeal-summary.js';
import { mapAppealStatus } from './map-appeal-status.js';
import { mapAppealTimetable } from './map-appeal-timetable.js';
import { mapAllocationDetails } from './map-allocation-details.js';
import { mapNeighbouringSites } from './map-neighbouring-sites.js';
import { mapTransferStatus } from './map-transfer-status.js';
import { mapAppealTeam } from './map-appeal-team.js';
import { mapDocumentationSummary } from './map-documentation-summary.js';
import { mapAppealRelationships } from './map-appeal-relationships.js';
import { mapSiteVisit } from './map-site-visit.js';
import { mapAppealWithdrawal } from './map-appeal-withdrawal.js';
import { mapAppealDecision } from './map-appeal-decision.js';
import { mapAppealFolders } from './map-folders-documents.js';
import { mapAppellantCase } from './map-appellant-case.js';
import { mapLpaQuestionnaire } from './map-lpa-questionnaire.js';

export const apiSharedMappers = {
	appealSummary: mapAppealSummary,
	appealStatus: mapAppealStatus,
	team: mapAppealTeam,
	siteVisit: mapSiteVisit,
	allocationDetails: mapAllocationDetails,
	appealTimetable: mapAppealTimetable,
	documentationSummary: mapDocumentationSummary,
	decision: mapAppealDecision,
	appealRelationships: mapAppealRelationships,
	neighbouringSites: mapNeighbouringSites,
	appealTransferStatus: mapTransferStatus,
	appellantCase: mapAppellantCase,
	lpaQuestionnaire: mapLpaQuestionnaire,
	withdrawal: mapAppealWithdrawal,
	folders: mapAppealFolders
};
