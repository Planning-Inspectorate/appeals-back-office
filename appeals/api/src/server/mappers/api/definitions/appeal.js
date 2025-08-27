import { AppealSummary } from './appeal-summary.js';
import { Team } from './team.js';
import { Allocation } from './allocation.js';
import { NeighbouringSite } from './neighbouring-site.js';
import { Timetable } from './timetable.js';
import { TransferStatus } from './transfer-status.js';
import { Folder } from './folders-documents.js';
import { AppealDecision } from './appeal-decision.js';
import { AppealRelationship } from './appeal-relationship.js';
import { SiteAccess } from './site-access.js';
import { SiteSafety } from './site-safety.js';
import { AssignedTeam } from './assigned-team.js';

const appeal = {
	type: 'object',
	required: ['appealId', 'appealReference'],
	properties: {
		...AppealSummary.properties,
		...Team.properties,
		...AssignedTeam.properties,
		allocation: {
			...Allocation,
			nullable: true
		},
		timetable: {
			...Timetable,
			nullable: true
		},
		transferStatus: {
			...TransferStatus,
			nullable: true
		},
		neighbouringSites: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					...NeighbouringSite.properties
				}
			}
		},
		appellantCaseId: {
			type: 'string',
			nullable: true
		},
		lpaQuestionnaireId: {
			type: 'string',
			nullable: true
		},
		inspectorAccess: {
			appellantCase: { ...SiteAccess },
			lpaQuestionnaire: { ...SiteAccess }
		},
		healthAndSafety: {
			appellantCase: { ...SiteSafety },
			lpaQuestionnaire: { ...SiteSafety }
		},
		linkedAppeals: {
			type: 'array',
			items: { ...AppealRelationship }
		},
		otherAppeals: {
			type: 'array',
			items: { ...AppealRelationship }
		},
		isParentAppeal: {
			type: 'boolean'
		},
		isChildAppeal: {
			type: 'boolean'
		},
		decision: {
			type: 'object',
			properties: {
				...AppealDecision.properties
			}
		},
		costs: {
			appellantApplicationFolder: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			},
			appellantWithdrawalFolder: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			},
			appellantCorrespondenceFolder: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			},
			lpaApplicationFolder: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			},
			lpaWithdrawalFolder: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			},
			lpaCorrespondenceFolder: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			},
			decisionFolder: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			},
			appellantDecisionFolder: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			},
			lpaDecisionFolder: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			}
		},
		internalCorrespondence: {
			crossTeam: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			},
			inspector: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			},
			mainParty: {
				type: 'object',
				properties: {
					...Folder.properties
				}
			}
		},
		environmentalAssessment: {
			type: 'object',
			properties: {
				...Folder.properties
			},
			nullable: true
		}
	}
};

export const Appeal = appeal;
