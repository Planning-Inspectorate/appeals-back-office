import { InvalidIncompleteReason } from './invalid-incomplete.js';

const appellantCase = {
	type: 'object',
	required: [],
	nullable: true,
	properties: {
		validation: {
			type: 'object',
			properties: {
				outcome: {
					type: 'string',
					nullable: true
				},
				incompleteReasons: {
					...InvalidIncompleteReason,
					nullable: true
				},
				invalidReasons: {
					...InvalidIncompleteReason,
					nullable: true
				}
			},
			nullable: true
		},
		applicant: {
			type: 'object',
			properties: {
				firstName: {
					type: 'string'
				},
				surname: {
					type: 'string'
				}
			}
		},
		isAppellantNamedOnApplication: {
			type: 'boolean'
		},
		applicationDate: {
			type: 'string',
			format: 'date-time'
		},
		applicationDecisionDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		applicationDecision: {
			type: 'string',
			nullable: true
		},
		hasAdvertisedAppeal: {
			type: 'boolean',
			nullable: true
		},
		appellantCostsAppliedFor: {
			type: 'boolean',
			nullable: true
		},
		enforcementNotice: {
			type: 'boolean',
			nullable: true
		},
		siteOwnership: {
			type: 'object',
			properties: {
				areAllOwnersKnown: {
					type: 'string',
					nullable: true
				},
				knowsOtherLandowners: {
					type: 'string',
					nullable: true
				},
				ownersInformed: {
					type: 'boolean',
					nullable: true
				},
				ownsAllLand: {
					type: 'boolean',
					nullable: true
				},
				ownsSomeLand: {
					type: 'boolean',
					nullable: true
				}
			}
		},
		siteAccessRequired: {
			type: 'object',
			properties: {
				details: {
					type: 'string',
					nullable: true
				},
				isRequired: {
					type: 'boolean'
				}
			}
		},
		healthAndSafety: {
			type: 'object',
			properties: {
				details: {
					type: 'string',
					nullable: true
				},
				hasIssues: {
					type: 'boolean'
				}
			}
		},
		appellantProcedurePreference: {
			type: 'string',
			nullable: true
		},
		appellantProcedurePreferenceDetails: {
			type: 'string',
			nullable: true
		},
		appellantProcedurePreferenceDuration: {
			type: 'number',
			nullable: true
		},
		appellantProcedurePreferenceWitnessCount: {
			type: 'number',
			nullable: true
		}
	}
};

export const AppellantCase = appellantCase;

/**
 * return {
			applicant: {
				firstName: appeal.appellant?.firstName || '',
				surname: appeal.appellant?.lastName || ''
			},
			isAppellantNamedOnApplication: appeal.agent == null,
			applicationDate: appellantCase.applicationDate && appellantCase.applicationDate.toISOString(),
			applicationDecision: appellantCase.applicationDecision || null,
			applicationDecisionDate:
				appellantCase.applicationDecisionDate &&
				appellantCase.applicationDecisionDate?.toISOString(),
			hasAdvertisedAppeal: appellantCase.hasAdvertisedAppeal,
			enforcementNotice: appellantCase?.enforcementNotice || null,
			appellantCostsAppliedFor: appellantCase.appellantCostsAppliedFor,
			siteOwnership: {
				areAllOwnersKnown: appellantCase.knowsAllOwners?.name || null,
				knowsOtherLandowners: appellantCase.knowsOtherOwners?.name || null,
				ownersInformed: appellantCase.ownersInformed || null,
				ownsAllLand: appellantCase.ownsAllLand || null,
				ownsSomeLand: appellantCase.ownsSomeLand || null
			},
			siteAccessRequired: {
				details: appellantCase?.siteAccessDetails,
				isRequired: appellantCase?.siteAccessDetails !== null
			},
			healthAndSafety: {
				details: appellantCase?.siteSafetyDetails,
				hasIssues: appellantCase?.siteSafetyDetails !== null
			},
			validation: formatValidationOutcomeResponse(
				appellantCase.appellantCaseValidationOutcome?.name || '',
				appellantCase.appellantCaseIncompleteReasonsSelected,
				appellantCase.appellantCaseInvalidReasonsSelected
			)
 */
/* Common */
// id                                     Int                                      @id @default(autoincrement())
// appeal                                 Appeal                                   @relation(fields: [appealId], references: [id])
// appealId                               Int                                      @unique
// appellantCaseIncompleteReasonsSelected AppellantCaseIncompleteReasonsSelected[]
// appellantCaseInvalidReasonsSelected    AppellantCaseInvalidReasonsSelected[]
// appellantCaseValidationOutcome         AppellantCaseValidationOutcome?          @relation(fields: [appellantCaseValidationOutcomeId], references: [id])
// appellantCaseValidationOutcomeId       Int?
// applicationDate                        DateTime                                 @default(now())
// applicationDecision                    String                                   @default("refused")
// applicationDecisionDate                DateTime?
// caseSubmittedDate                      DateTime                                 @default(now())
// caseSubmissionDueDate                  DateTime?
// siteAccessDetails                      String?
// siteSafetyDetails                      String?
// siteAreaSquareMetres                   Decimal?
// floorSpaceSquareMetres                 Decimal?
// ownsAllLand                            Boolean?
// ownsSomeLand                           Boolean?
// knowsOtherOwners                       KnowledgeOfOtherLandowners?              @relation("knowsOtherOwners", fields: [knowsOtherOwnersId], references: [id], onDelete: NoAction, onUpdate: NoAction)
// knowsOtherOwnersId                     Int?
// knowsAllOwners                         KnowledgeOfOtherLandowners?              @relation("knowsAllOwners", fields: [knowsAllOwnersId], references: [id], onDelete: NoAction, onUpdate: NoAction)
// knowsAllOwnersId                       Int?
// hasAdvertisedAppeal                    Boolean?
// appellantCostsAppliedFor               Boolean?
// originalDevelopmentDescription         String?
// changedDevelopmentDescription          Boolean?
// ownersInformed                         Boolean?
// enforcementNotice                      Boolean?
// isGreenBelt                            Boolean?

/* S78 */
// agriculturalHolding                      Boolean?
// tenantAgriculturalHolding                Boolean?
// otherTenantsAgriculturalHolding          Boolean?
// informedTenantsAgriculturalHolding       Boolean?
// appellantProcedurePreference             String?
// appellantProcedurePreferenceDetails      String?
// appellantProcedurePreferenceDuration     Int?
// appellantProcedurePreferenceWitnessCount Int?
// planningObligation                       Boolean?
// statusPlanningObligation                 String?
// siteViewableFromRoad                     Boolean?
// caseworkReason                           String?
// developmentType                          String?
// jurisdiction                             String?
// numberOfResidencesNetChange              Int?
// siteGridReferenceEasting                 String?
// siteGridReferenceNorthing                String?
