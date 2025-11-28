import {
	APPEAL_DEVELOPMENT_TYPE,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';
import { Address } from './address.js';
import { AppealSummary } from './appeal-summary.js';
import { Folder } from './folders-documents.js';
import { InvalidIncompleteReason } from './invalid-incomplete.js';

const updateableFields = {
	applicationDate: {
		type: 'string',
		format: 'date-time',
		nullable: true
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
	appellantCostsAppliedFor: {
		type: 'boolean',
		nullable: true
	},
	hasAdvertisedAppeal: {
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
	},
	siteAreaSquareMetres: {
		type: 'number',
		nullable: true
	},
	floorSpaceSquareMetres: {
		type: 'number',
		nullable: true
	},
	enforcementNotice: {
		type: 'boolean',
		nullable: true
	},
	enforcementNoticeListedBuilding: {
		type: 'boolean',
		nullable: true
	},
	enforcementReference: {
		type: 'string',
		nullable: true
	},
	enforcementIssueDate: {
		type: 'string',
		format: 'date-time',
		nullable: true
	},
	enforcementEffectiveDate: {
		type: 'string',
		format: 'date-time',
		nullable: true
	},
	contactPlanningInspectorateDate: {
		type: 'string',
		format: 'date-time',
		nullable: true
	},
	interestInLand: {
		type: 'string',
		nullable: true
	},
	writtenOrVerbalPermission: {
		type: 'string',
		nullable: true
	},
	contactAddress: {
		...Address
	},
	isGreenBelt: {
		type: 'boolean',
		nullable: true
	},
	planningObligation: {
		type: 'boolean',
		nullable: true
	},
	statusPlanningObligation: {
		type: 'string',
		nullable: true
	},
	agriculturalHolding: {
		type: 'boolean',
		nullable: true
	},
	tenantAgriculturalHolding: {
		type: 'boolean',
		nullable: true
	},
	otherTenantsAgriculturalHolding: {
		type: 'boolean',
		nullable: true
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
	},
	developmentDescription: {
		type: 'object',
		properties: {
			details: { type: 'string', nullable: true },
			isChanged: { type: 'boolean' }
		}
	},
	developmentType: {
		type: 'string',
		nullable: true,
		enum: [...Object.values(APPEAL_DEVELOPMENT_TYPE)]
	},
	typeOfPlanningApplication: {
		type: 'string',
		nullable: true,
		enum: [...Object.values(APPEAL_TYPE_OF_PLANNING_APPLICATION)]
	},
	highwayLand: {
		type: 'boolean',
		nullable: true
	},
	advertInPosition: {
		type: 'boolean',
		nullable: true
	},
	landownerPermission: {
		type: 'boolean',
		nullable: true
	},
	siteGridReferenceEasting: {
		type: 'string',
		nullable: true
	},
	siteGridReferenceNorthing: {
		type: 'string',
		nullable: true
	}
};

const appellantCase = {
	type: 'object',
	nullable: true,
	properties: {
		appellantCaseId: {
			type: 'number'
		},
		numberOfResidencesNetChange: {
			type: 'number',
			nullable: true
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
				},
				invalidReasons: {
					type: 'array',
					items: {
						...InvalidIncompleteReason
					},
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
		planningObligation: {
			hasObligation: {
				type: 'boolean'
			},
			status: {
				type: 'string',
				nullable: true
			}
		},
		agriculturalHolding: {
			isPartOfAgriculturalHolding: { type: 'boolean' },
			isTenant: { type: 'boolean' },
			hasOtherTenants: { type: 'boolean' }
		},
		documents: {
			type: 'object',
			properties: {
				appellantStatement: { ...Folder },
				originalApplicationForm: { ...Folder },
				applicationDecisionLetter: { ...Folder },
				changedDescription: { ...Folder },
				appellantCaseWithdrawalLetter: { ...Folder },
				appellantCaseCorrespondence: { ...Folder },
				designAccessStatement: { ...Folder },
				plansDrawings: { ...Folder },
				newPlansDrawings: { ...Folder },
				planningObligation: { ...Folder },
				ownershipCertificate: { ...Folder },
				otherNewDocuments: { ...Folder },
				statementCommonGround: { ...Folder }
			}
		},
		enforcementNotice: {
			type: 'object',
			properties: {
				isReceived: {
					type: 'boolean',
					nullable: true
				},
				isListedBuilding: {
					type: 'boolean',
					nullable: true
				},
				issueDate: {
					type: 'string',
					format: 'date-time',
					nullable: true
				},
				effectiveDate: {
					type: 'string',
					format: 'date-time',
					nullable: true
				},
				contactPlanningInspectorateDate: {
					type: 'string',
					format: 'date-time',
					nullable: true
				},
				reference: {
					type: 'string',
					nullable: true
				},
				interestInLand: {
					type: 'string',
					nullable: true
				},
				writtenOrVerbalPermission: {
					type: 'string',
					nullable: true
				},
				contactAddress: {
					...Address
				}
			}
		}
	}
};

export const AppellantCase = appellantCase;

export const AppellantCaseUpdateRequest = {
	type: 'object',
	properties: {
		appealId: {
			type: 'number'
		},
		...updateableFields,
		appellantCaseValidationOutcomeId: { type: 'number', nullable: true },
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
		invalidReasons: {
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
				appealDueDate: {
					type: 'string',
					format: 'date-time'
				}
			},
			nullable: true
		},
		siteAccessDetails: { type: 'string', nullable: true },
		siteSafetyDetails: { type: 'string', nullable: true },
		applicantFirstName: {
			type: 'string',
			nullable: true
		},
		applicantSurname: {
			type: 'string',
			nullable: true
		},
		areAllOwnersKnown: {
			type: 'string',
			nullable: true
		},
		knowsOtherOwners: {
			type: 'string',
			nullable: true
		},
		originalDevelopmentDescription: {
			type: 'string',
			nullable: true
		},
		changedDevelopmentDescription: {
			type: 'string',
			nullable: true
		},
		numberOfResidencesNetChange: {
			type: 'number',
			nullable: true
		},
		highwayLand: {
			type: 'boolean',
			nullable: true
		},
		advertInPosition: {
			type: 'boolean',
			nullable: true
		},
		landownerPermission: {
			type: 'boolean',
			nullable: true
		},
		siteGridReferenceEasting: {
			type: 'string',
			nullable: true
		},
		siteGridReferenceNorthing: {
			type: 'string',
			nullable: true
		}
	}
};
