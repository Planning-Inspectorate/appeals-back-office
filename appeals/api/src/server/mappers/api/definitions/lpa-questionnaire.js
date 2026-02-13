import { APPEAL_APPEAL_UNDER_ACT_SECTION } from '@planning-inspectorate/data-model';
import { AppealSummary } from './appeal-summary.js';
import { DesignatedSiteName } from './designated-site-name.js';
import { Folder } from './folders-documents.js';
import { InvalidIncompleteReason } from './invalid-incomplete.js';
import { ListedBuilding } from './listed-building.js';
import { SiteAccess } from './site-access.js';
import { SiteSafety } from './site-safety.js';

const updateableFields = {
	isCorrectAppealType: {
		type: 'boolean',
		nullable: true
	},
	isGreenBelt: {
		type: 'boolean',
		nullable: true
	},
	isConservationArea: {
		type: 'boolean',
		nullable: true
	},
	lpaProcedurePreference: {
		type: 'string',
		nullable: true
	},
	lpaProcedurePreferenceDetails: {
		type: 'string',
		nullable: true
	},
	lpaProcedurePreferenceDuration: {
		type: 'number',
		nullable: true
	},
	lpaStatement: {
		type: 'string',
		nullable: true
	},
	extraConditions: {
		type: 'string',
		nullable: true
	},
	hasExtraConditions: {
		type: 'boolean',
		nullable: true
	},
	affectsScheduledMonument: {
		type: 'boolean',
		nullable: true
	},
	hasProtectedSpecies: {
		type: 'boolean',
		nullable: true
	},
	isAonbNationalLandscape: {
		type: 'boolean',
		nullable: true
	},
	isGypsyOrTravellerSite: {
		type: 'boolean',
		nullable: true
	},
	hasInfrastructureLevy: {
		type: 'boolean',
		nullable: true
	},
	isInfrastructureLevyFormallyAdopted: {
		type: 'boolean',
		nullable: true
	},
	infrastructureLevyAdoptedDate: {
		type: 'string',
		format: 'date-time',
		nullable: true
	},
	infrastructureLevyExpectedDate: {
		type: 'string',
		format: 'date-time',
		nullable: true
	},
	eiaColumnTwoThreshold: {
		type: 'boolean',
		nullable: true
	},
	eiaRequiresEnvironmentalStatement: {
		type: 'boolean',
		nullable: true
	},
	eiaEnvironmentalImpactSchedule: {
		type: 'string',
		nullable: true
	},
	eiaDevelopmentDescription: {
		type: 'string',
		nullable: true
	},
	eiaSensitiveAreaDetails: {
		type: 'string',
		nullable: true
	},
	consultedBodiesDetails: {
		type: 'string',
		nullable: true
	},
	reasonForNeighbourVisits: {
		type: 'string',
		nullable: true
	},
	preserveGrantLoan: {
		type: 'boolean',
		nullable: true
	},
	isSiteInAreaOfSpecialControlAdverts: {
		type: 'boolean',
		nullable: true
	},
	wasApplicationRefusedDueToHighwayOrTraffic: {
		type: 'boolean',
		nullable: true
	},
	didAppellantSubmitCompletePhotosAndPlans: {
		type: 'boolean',
		nullable: true
	},
	designatedSiteNames: {
		type: 'array',
		items: {
			...DesignatedSiteName
		},
		nullable: true
	},
	appealUnderActSection: {
		type: 'string',
		nullable: true,
		enum: Object.values(APPEAL_APPEAL_UNDER_ACT_SECTION)
	},
	lpaConsiderAppealInvalid: {
		type: 'boolean',
		nullable: true
	},
	lpaAppealInvalidReasons: {
		type: 'string',
		nullable: true
	},
	noticeRelatesToBuildingEngineeringMiningOther: {
		type: 'boolean',
		nullable: true
	},
	siteAreaSquareMetres: {
		type: 'number',
		nullable: true
	},
	areaOfAllegedBreachInSquareMetres: {
		type: 'number',
		nullable: true
	},
	floorSpaceCreatedByBreachInSquareMetres: {
		type: 'number',
		nullable: true
	},
	changeOfUseRefuseOrWaste: {
		type: 'boolean',
		nullable: true
	},
	changeOfUseMineralExtraction: {
		type: 'boolean',
		nullable: true
	},
	changeOfUseMineralStorage: {
		type: 'boolean',
		nullable: true
	},
	relatesToErectionOfBuildingOrBuildings: {
		type: 'boolean',
		nullable: true
	},
	relatesToBuildingWithAgriculturalPurpose: {
		type: 'boolean',
		nullable: true
	},
	relatesToBuildingSingleDwellingHouse: {
		type: 'boolean',
		nullable: true
	},
	affectedTrunkRoadName: {
		type: 'string',
		nullable: true
	},
	isSiteOnCrownLand: {
		type: 'boolean',
		nullable: true
	},
	article4AffectedDevelopmentRights: {
		type: 'string',
		nullable: true
	}
};

const lpaQuestionnaire = {
	type: 'object',
	nullable: true,
	properties: {
		lpaQuestionnaireId: {
			type: 'number'
		},
		...AppealSummary.properties,
		...updateableFields,
		validation: {
			type: 'object',
			properties: {
				outcome: {
					type: 'string',
					nullable: true
				},
				incompleteReasons: {
					type: 'array',
					items: {
						...InvalidIncompleteReason
					},
					nullable: true
				}
			},
			nullable: true
		},
		submittedAt: {
			type: 'string',
			format: 'date-time'
		},
		receivedAt: {
			type: 'string',
			format: 'date-time'
		},
		costsAppliedFor: {
			type: 'boolean',
			nullable: true
		},
		lpaNotificationMethods: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: {
						type: 'string'
					}
				}
			},
			nullable: true
		},
		siteAccessRequired: {
			...SiteAccess
		},
		healthAndSafety: {
			...SiteSafety
		},
		listedBuildingDetails: {
			type: 'array',
			items: {
				...ListedBuilding
			},
			nullable: true
		},
		documents: {
			type: 'object',
			properties: {
				whoNotified: { ...Folder },
				whoNotifiedSiteNotice: { ...Folder },
				whoNotifiedLetterToNeighbours: { ...Folder },
				whoNotifiedPressAdvert: { ...Folder },
				conservationMap: { ...Folder },
				otherPartyRepresentations: { ...Folder },
				planningOfficerReport: { ...Folder },
				plansDrawings: { ...Folder },
				developmentPlanPolicies: { ...Folder },
				treePreservationPlan: { ...Folder },
				definitiveMapStatement: { ...Folder },
				communityInfrastructureLevy: { ...Folder },
				supplementaryPlanning: { ...Folder },
				emergingPlan: { ...Folder },
				consultationResponses: { ...Folder },
				eiaEnvironmentalStatement: { ...Folder },
				eiaScreeningOpinion: { ...Folder },
				eiaScreeningDirection: { ...Folder },
				eiaScopingOpinion: { ...Folder },
				lpaCaseCorrespondence: { ...Folder },
				otherRelevantPolicies: { ...Folder },
				historicEnglandConsultation: { ...Folder },
				stopNotice: { ...Folder },
				article4Direction: { ...Folder },
				enforcementList: { ...Folder },
				localDevelopmentOrder: { ...Folder },
				planningPermission: { ...Folder },
				lpaEnforcementNotice: { ...Folder },
				lpaEnforcementNoticePlan: { ...Folder },
				planningContraventionNotice: { ...Folder }
			},
			nullable: true
		}
	}
};

export const LpaQuestionnaire = lpaQuestionnaire;

export const LpaQuestionnaireUpdateRequest = {
	type: 'object',
	properties: {
		appealId: {
			type: 'number'
		},
		...updateableFields,
		validationOutcomeId: { type: 'number', nullable: true },
		validationOutcome: {
			type: 'object',
			properties: {
				id: { type: 'number' },
				name: { type: 'string' }
			},
			nullable: true
		},
		incompleteReasons: {
			type: 'array',
			items: {
				type: 'object',
				required: ['id'],
				properties: {
					id: {
						type: 'number'
					},
					text: {
						type: 'array',
						items: {
							type: 'string'
						}
					}
				}
			},
			nullable: true
		},
		timetable: {
			type: 'object',
			properties: {
				lpaQuestionnaireDueDate: {
					type: 'string',
					format: 'date-time'
				}
			},
			nullable: true
		},
		siteAccessDetails: { type: 'string', nullable: true },
		siteSafetyDetails: { type: 'string', nullable: true },
		lpaNotificationMethods: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: {
						type: 'number'
					}
				}
			},
			nullable: true
		},
		lpaCostsAppliedFor: {
			type: 'boolean',
			nullable: true
		},
		designatedSiteNameCustom: {
			type: 'string',
			nullable: true
		}
	}
};
