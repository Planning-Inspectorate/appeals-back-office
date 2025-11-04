import {
	addDocumentsRequest,
	addDocumentVersionRequest,
	auditTrailUserInfo,
	blobInfo,
	documentDetails,
	documentVersionAuditEntry,
	documentVersionDetails,
	folder,
	folderWithDocs
} from '#tests/documents/mocks.js';
import {
	validAppellantCase,
	validLpaQuestionnaireHas,
	validRepresentationIp
} from '#tests/integrations/mocks.js';
import {
	linkedAppealLegacyRequest,
	linkedAppealRequest,
	relatedAppealLegacyRequest,
	relatedAppealRequest,
	unlinkAppealRequest
} from '#tests/linked-appeals/mocks.js';
import { createRepRequest, repResponse, repUpdateRequest } from '#tests/representations/mocks.js';
import {
	SITE_VISIT_TYPE_ACCESS_REQUIRED,
	SITE_VISIT_TYPE_ACCOMPANIED,
	SITE_VISIT_TYPE_UNACCOMPANIED
} from '@pins/appeals/constants/support.js';

import { ApiDefinitions } from '#mappers/api/definitions/index.js';

export const spec = {
	info: {
		// by default: '1.0.0'
		version: '2.0',
		// by default: 'REST API'
		title: 'PINS Back Office Appeals API',
		// by default: ''
		description: 'PINS Back Office Appeals API documentation from Swagger'
	},
	// by default: 'localhost:3000'
	host: '',
	// by default: '/'
	basePath: '',
	// by default: ['http']
	schemes: [],
	// by default: ['application/json']
	consumes: [],
	// by default: ['application/json']
	produces: [],
	// by default: empty Array
	tags: [
		{
			// Tag name
			name: '',
			// Tag description
			description: ''
		}
		// { ... }
	],
	// by default: empty object (Swagger 2.0)
	securityDefinitions: {},
	definitions: {
		LinkedAppealRequest: {
			...linkedAppealRequest
		},
		LinkedAppealLegacyRequest: {
			...linkedAppealLegacyRequest
		},
		RelatedAppealRequest: {
			...relatedAppealRequest
		},
		RelatedAppealLegacyRequest: {
			...relatedAppealLegacyRequest
		},
		UnlinkAppealRequest: {
			...unlinkAppealRequest
		},
		RepUpdateRequest: {
			...repUpdateRequest
		},
		CreateRepRequest: {
			...createRepRequest
		},
		RepResponse: {
			...repResponse
		},
		ValidateDate: {
			inputDate: '2024-11-10T00:00:00.000Z'
		},
		AddBusinessDays: {
			inputDate: '2024-08-17',
			numDays: 7
		},
		AppellantCaseData: {
			...validAppellantCase
		},
		QuestionnaireData: {
			...validLpaQuestionnaireHas
		},
		RepresentationData: {
			...validRepresentationIp
		},
		DecisionInfo: {
			decisions: [
				{
					decisionType: 'inspector-decision',
					outcome: 'allowed',
					documentGuid: 'c957e9d0-1a02-4650-acdc-f9fdd689c210',
					documentDate: '2024-08-17'
				}
			]
		},
		//ToDo: Remove once the new version of issue decisions is released
		OldDecisionInfo: {
			outcome: 'allowed',
			documentGuid: 'c957e9d0-1a02-4650-acdc-f9fdd689c210',
			documentDate: '2024-08-17'
		},

		InvalidDecisionInfo: {
			invalidDecisionReason: 'Invalid Decision Reason'
		},
		AddDocumentsRequest: {
			...addDocumentsRequest
		},
		AddDocumentVersionRequest: {
			...addDocumentVersionRequest
		},
		AddDocumentsResponse: {
			documents: [{ ...blobInfo }]
		},
		Folder: {
			...folder
		},
		DocumentVersionDetails: {
			...documentVersionDetails
		},
		DocumentDetails: {
			...documentDetails
		},
		AuditTrailUserInfo: {
			...auditTrailUserInfo
		},
		DocumentVersionAuditEntry: {
			...documentVersionAuditEntry
		},
		AppealTypeChangeRequest: {
			newAppealTypeId: 32,
			newAppealTypeFinalDate: '2024-02-02'
		},
		AppealTypeResubmitMarkInvalidRequest: {
			newAppealTypeId: 32,
			newAppealTypeFinalDate: '2024-02-02',
			appellantCaseId: 12
		},
		AppealTypeTransferRequest: {
			newAppealTypeId: 32
		},
		AppealTypeTransferConfirmationRequest: {
			newAppealReference: '76215416'
		},
		AppealTypeUpdateRequest: {
			newAppealTypeId: 32
		},
		AppealTypes: [
			{
				type: 'Appeal type name',
				code: 'A',
				enabled: false,
				shorthand: 'HAS',
				id: 1
			}
		],
		CaseTeam: {
			id: 1,
			name: 'Ops Test',
			email: 'opstest@email.com'
		},
		CaseTeams: [
			{
				id: 1,
				name: 'Ops Test',
				email: 'opstest@email.com'
			}
		],
		AllAppeals: {
			itemCount: 57,
			items: [
				{
					appealId: 1,
					appealReference: 'APP/Q9999/D/21/235348',
					appealSite: {
						addressLine1: '19 Beauchamp Road',
						town: 'Bristol',
						county: 'Bristol',
						postCode: 'BS7 8LQ'
					},
					appealStatus: 'awaiting_lpa_questionnaire',
					appealType: 'household',
					createdAt: '2024-02-16T11:43:27.096Z',
					localPlanningDepartment: 'Wiltshire Council',
					appellantCaseStatus: 'Incomplete',
					lpaQuestionnaireStatus: 'Incomplete',
					dueDate: '2024-06-18T00:00:00.000Z'
				}
			],
			statuses: ['lpa_questionnaire'],
			lpas: [
				{
					name: 'Bristol City Council',
					lpaCode: 'BRIS'
				}
			],
			inspectors: [
				{
					azureAdUserId: '927c9ef9-071d-46f2-bc9e-f9071d26f26b',
					inspectorId: 22
				}
			],
			caseOfficers: [
				{
					name: 'db7481a7-f77f-40e8-b481-a7f77fc0e805',
					inspectorId: 18
				}
			],
			page: 1,
			pageCount: 27,
			pageSize: 30
		},
		ManyAppeals: {
			itemCount: 57,
			items: [
				{
					appealId: 1,
					appealReference: 'APP/Q9999/D/21/235348',
					appealSite: {
						addressLine1: '19 Beauchamp Road',
						town: 'Bristol',
						county: 'Bristol',
						postCode: 'BS7 8LQ'
					},
					appealStatus: 'awaiting_lpa_questionnaire',
					appealType: 'household',
					createdAt: '2024-02-16T11:43:27.096Z',
					localPlanningDepartment: 'Wiltshire Council',
					appellantCaseStatus: 'Incomplete',
					lpaQuestionnaireStatus: 'Incomplete',
					dueDate: '2024-06-18T00:00:00.000Z'
				}
			]
		},
		SingleAppealResponse: {
			agent: {
				serviceUserId: 199,
				firstName: 'Some',
				lastName: 'User',
				organisationName: 'Some Company',
				email: 'an email address',
				phoneNumber: null
			},
			appellant: {
				serviceUserId: 200,
				firstName: 'Another',
				lastName: 'User',
				organisationName: null,
				phoneNumber: null
			},
			allocationDetails: null,
			appealId: 118,
			appealReference: '6000118',
			appealSite: {
				addressId: 122,
				addressLine1: 'FOR TRAINERS ONLY',
				addressLine2: '44 Rivervale',
				town: 'Bridport',
				postCode: 'DT6 5RN'
			},
			costs: {
				appellantApplicationFolder: {
					caseId: '118',
					documents: [],
					folderId: 2200,
					path: 'costs/appellantApplication'
				},
				appellantWithdrawalFolder: {
					caseId: '118',
					documents: [],
					folderId: 2201,
					path: 'costs/appellantWithdrawal'
				},
				appellantCorrespondenceFolder: {
					caseId: '118',
					documents: [],
					folderId: 2202,
					path: 'costs/appellantCorrespondence'
				},
				lpaApplicationFolder: {
					caseId: '118',
					documents: [],
					folderId: 2300,
					path: 'costs/lpaApplication'
				},
				lpaWithdrawalFolder: {
					caseId: '118',
					documents: [],
					folderId: 2301,
					path: 'costs/lpaWithdrawal'
				},
				lpaCorrespondenceFolder: {
					caseId: '118',
					documents: [],
					folderId: 2302,
					path: 'costs/lpaCorrespondence'
				},
				appellantDecisionFolder: {
					caseId: '118',
					documents: [],
					folderId: 2401,
					path: 'costs/appellantDecision'
				},
				lpaDecisionFolder: {
					caseId: '118',
					documents: [],
					folderId: 2402,
					path: 'costs/lpaDecision'
				}
			},
			internalCorrespondence: {
				crossTeam: {
					caseId: '118',
					documents: [],
					folderId: 2121,
					path: 'internal/crossTeamCorrespondence'
				},
				inspector: {
					caseId: '118',
					documents: [],
					folderId: 2122,
					path: 'internal/inspectorCorrespondence'
				},
				mainParty: {
					caseId: '118',
					documents: [],
					folderId: 2123,
					path: 'internal/mainPartyCorrespondence'
				}
			},
			neighbouringSites: [],
			appealStatus: 'ready_to_start',
			appealTimetable: null,
			appealType: 'Householder',
			appellantCaseId: 118,
			caseOfficer: '00000000-0000-0000-0000-000000000000',
			decision: {
				folderId: 2124
			},
			healthAndSafety: {
				appellantCase: {
					details: null,
					hasIssues: false
				},
				lpaQuestionnaire: {
					hasIssues: true
				}
			},
			inspector: null,
			inspectorAccess: {
				appellantCase: {
					details: null,
					isRequired: false
				},
				lpaQuestionnaire: {
					isRequired: true
				}
			},
			otherAppeals: [],
			linkedAppeals: [
				{
					appealId: 120,
					appealReference: '6000120',
					isParentAppeal: true,
					linkingDate: '2024-06-26T11:57:40.270Z',
					appealType: '(D) Householder',
					relationshipId: 24,
					externalSource: false
				}
			],
			awaitingLinkedAppeal: true,
			costsDecision: {
				awaitingAppellantCostsDecision: false,
				awaitingLpaCostsDecision: false
			},
			isParentAppeal: false,
			isChildAppeal: true,
			localPlanningDepartment: 'Some Borough Council',
			lpaEmailAddress: 'lpa@example.com',
			lpaQuestionnaireId: null,
			planningApplicationReference: '52279/APP/1/151419',
			procedureType: 'Written',
			createdAt: '2024-06-26T11:57:39.953Z',
			startedAt: null,
			validAt: '2024-06-12T22:57:37.724Z',
			documentationSummary: {
				appellantCase: {
					status: 'received',
					dueDate: null,
					receivedAt: '2024-06-26T11:57:39.953Z'
				},
				lpaQuestionnaire: {
					status: 'not_received'
				}
			},
			stateList: [],
			completedStateList: ['awaiting_event']
		},
		SingleAppellantCaseResponse: {
			agriculturalHolding: {
				isPartOfAgriculturalHolding: true,
				isTenant: true,
				hasOtherTenants: true
			},
			appealId: 1,
			appealReference: 'APP/Q9999/D/21/965625',
			appealSite: {
				addressId: 1,
				addressLine1: '21 The Pavement',
				county: 'Wandsworth',
				postCode: 'SW4 0HY'
			},
			appellantCaseId: 1,
			appellant: {
				appellantId: 1,
				company: 'Roger Simmons Ltd',
				name: 'Roger Simmons'
			},
			applicant: {
				firstName: 'Fiona',
				surname: 'Burgess'
			},
			developmentDescription: {
				details: 'A new extension has been added at the back',
				isChanged: false
			},
			isGreenBelt: true,
			documents: {
				appealStatement: {
					folderId: 4562,
					documents: []
				},
				applicationForm: {
					folderId: 4563,
					documents: []
				},
				decisionLetter: {
					folderId: 4564,
					documents: []
				},
				newSupportingDocuments: {
					folderId: 4569,
					documents: []
				},
				plansDrawings: {
					folderId: 4570,
					documents: []
				},
				planningObligation: {
					folderId: 4571,
					documents: []
				},
				designAccessStatement: {
					folderId: 4572,
					documents: []
				},
				ownershipCertificate: {
					folderId: 4573,
					documents: []
				},
				newPlansDrawings: {
					folderId: 4574,
					documents: []
				},
				otherNewDocuments: {
					folderId: 4575,
					documents: []
				},
				statementCommonGround: {
					folderId: 4576,
					documents: []
				}
			},
			appellantProcedurePreference: 'Hearing',
			appellantProcedurePreferenceDetails: 'Reason for preference',
			appellantProcedurePreferenceDuration: 0,
			appellantProcedurePreferenceWitnessCount: 0,
			hasAdvertisedAppeal: true,
			hasDesignAndAccessStatement: true,
			hasNewPlansOrDrawings: true,
			hasNewSupportingDocuments: true,
			hasSeparateOwnershipCertificate: true,
			healthAndSafety: {
				details: 'There is no mobile reception at the site',
				hasIssues: true
			},
			isAppellantNamedOnApplication: false,
			localPlanningDepartment: 'Wiltshire Council',
			planningObligation: {
				hasObligation: true,
				status: 'Finalised'
			},
			procedureType: 'written',
			siteOwnership: {
				areAllOwnersKnown: true,
				hasAttemptedToIdentifyOwners: true,
				hasToldOwners: true,
				ownsAllLand: false,
				ownsSomeLand: true,
				knowsOtherLandowners: 'Some'
			},
			validation: {
				outcome: 'Incomplete',
				incompleteReasons: [
					'Appellant name is not the same on the application form and appeal form',
					'Attachments and/or appendices have not been included to the full statement of case',
					'Other'
				]
			},
			visibility: {
				details: 'The site is behind a tall hedge',
				isVisible: false
			},
			numberOfResidencesNetChange: 0,
			highwayLand: false,
			advertInPosition: true,
			landownerPermission: true,
			siteGridReferenceEasting: '123456',
			siteGridReferenceNorthing: '654321'
		},
		UpdateCaseTeamRequest: {
			caseOfficer: '13de469c-8de6-4908-97cd-330ea73df618',
			inspector: 'f7ea429b-65d8-4c44-8fc2-7f1a34069855'
		},
		UpdateCaseTeamResponse: {
			caseOfficer: '13de469c-8de6-4908-97cd-330ea73df618',
			inspector: 'f7ea429b-65d8-4c44-8fc2-7f1a34069855'
		},
		StartCaseRequest: {
			startDate: '2024-05-09',
			procedureType: 'written',
			hearingStartTime: '2024-05-09T12:00:00.000Z'
		},
		StartCaseResponse: {
			finalCommentReviewDate: '2024-08-09',
			issueDeterminationDate: '2024-08-10',
			lpaQuestionnaireDueDate: '2024-08-11',
			statementReviewDate: '2024-08-12'
		},
		StartCaseNotifyPreviewResponse: {
			appellant: {
				renderedHtml: 'Rendered HTML for appellant preview'
			},
			lpa: {
				renderedHtml: 'Rendered HTML for LPA preview'
			}
		},
		SingleLPAQuestionnaireResponse: {
			affectsListedBuildingDetails: [
				{
					listEntry: '654321'
				}
			],
			appealId: 1,
			appealReference: 'APP/Q9999/D/21/526184',
			appealSite: {
				addressLine1: '92 Huntsmoor Road',
				county: 'Tadley',
				postCode: 'RG26 4BX'
			},
			communityInfrastructureLevyAdoptionDate: '2024-05-09T01:00:00.000Z',
			designatedSites: [
				{
					name: 'cSAC',
					description: 'candidate special area of conservation'
				}
			],
			developmentDescription: '',
			documents: {
				communityInfrastructureLevy: folderWithDocs,
				conservationAreaMapAndGuidance: folderWithDocs,
				consultationResponses: folderWithDocs,
				definitiveMapAndStatement: folderWithDocs,
				emergingPlans: folderWithDocs,
				environmentalStatementResponses: folderWithDocs,
				issuedScreeningOption: folderWithDocs,
				lettersToNeighbours: folderWithDocs,
				otherRelevantPolicies: folderWithDocs,
				planningOfficersReport: folderWithDocs,
				policiesFromStatutoryDevelopment: folderWithDocs,
				pressAdvert: folderWithDocs,
				relevantPartiesNotification: folderWithDocs,
				representationsFromOtherParties: folderWithDocs,
				responsesOrAdvice: folderWithDocs,
				screeningDirection: folderWithDocs,
				scopingOpinion: folderWithDocs,
				siteNotice: folderWithDocs,
				supplementaryPlanningtestDocuments: folderWithDocs,
				treePreservationOrder: folderWithDocs,
				historicEnglandConsultation: folderWithDocs
			},
			doesAffectAListedBuilding: true,
			doesAffectAScheduledMonument: true,
			doesSiteHaveHealthAndSafetyIssues: true,
			doesSiteRequireInspectorAccess: true,
			extraConditions: 'Some extra conditions',
			hasCommunityInfrastructureLevy: true,
			hasCompletedAnEnvironmentalStatement: true,
			hasExtraConditions: true,
			hasProtectedSpecies: true,
			hasRepresentationsFromOtherParties: true,
			hasResponsesOrStandingAdviceToUpload: true,
			hasStatementOfCase: true,
			hasStatutoryConsultees: true,
			hasSupplementaryPlanningDocuments: true,
			healthAndSafetyDetails: 'There is no mobile signal at the property',
			inCAOrrelatesToCA: true,
			includesScreeningOption: true,
			inquiryDays: 2,
			inspectorAccessDetails: 'The entrance is at the back of the property',
			isCommunityInfrastructureLevyFormallyAdopted: true,
			isConservationArea: true,
			isCorrectAppealType: true,
			isEnvironmentalStatementRequired: true,
			isGypsyOrTravellerSite: true,
			isListedBuilding: true,
			isPublicRightOfWay: true,
			isSensitiveArea: true,
			isSiteVisible: true,
			isTheSiteWithinAnAONB: true,
			listedBuildingDetails: [
				{
					listEntry: '123456'
				}
			],
			localPlanningDepartment: 'Wiltshire Council',
			lpaNotificationMethods: [
				{
					name: 'A site notice'
				}
			],
			lpaQuestionnaireId: 1,
			meetsOrExceedsThresholdOrCriteriaInColumn2: true,
			otherAppeals: [
				{
					appealId: 1,
					appealReference: 'APP/Q9999/D/21/725284'
				}
			],
			procedureType: 'Written',
			scheduleType: 'Schedule 1',
			sensitiveAreaDetails: 'The area is prone to flooding',
			isGreenBelt: true,
			statutoryConsulteesDetails: 'Some other people need to be consulted',
			validation: {
				outcome: 'Incomplete',
				incompleteReasons: ['Documents or information are missing', 'Policies are missing', 'Other']
			},
			reasonForNeighbourVisits: 'The inspector needs to access the neighbouring site',
			preserveGrantLoan: true,
			isSiteInAreaOfSpecialControlAdverts: true,
			wasApplicationRefusedDueToHighwayOrTraffic: true,
			didAppellantSubmitCompletePhotosAndPlans: true
		},
		UpdateAppellantCaseRequest: {
			appealDueDate: '2024-12-13',
			applicantFirstName: 'Fiona',
			applicantSurname: 'Burgess',
			areAllOwnersKnown: true,
			hasAdvertisedAppeal: true,
			hasAttemptedToIdentifyOwners: true,
			hasHealthAndSafetyIssues: true,
			healthAndSafetyIssues: 'There is no mobile reception at the site',
			incompleteReasons: [
				{
					id: 1,
					text: ['Incomplete reason 1', 'Incomplete reason 2', 'Incomplete reason 3']
				}
			],
			invalidReasons: [
				{
					id: 1,
					text: ['Invalid reason 1', 'Invalid reason 2', 'Invalid reason 3']
				}
			],
			isSiteFullyOwned: false,
			isSitePartiallyOwned: true,
			isSiteVisibleFromPublicRoad: false,
			validationOutcome: 'valid',
			visibilityRestrictions: 'The site is behind a tall hedge',
			isGreenBelt: true,
			appellantProcedurePreference: 'Hearing',
			appellantProcedurePreferenceDetails: 'Reason for preference',
			appellantProcedurePreferenceDuration: 3,
			appellantProcedurePreferenceWitnessCount: 2,
			numberOfResidencesNetChange: 0,
			highwayLand: false,
			advertInPosition: true,
			landownerPermission: true,
			siteGridReferenceEasting: '123456',
			siteGridReferenceNorthing: '654321'
		},
		UpdateAppellantCaseResponse: {},
		UpdateLPAQuestionnaireRequest: {
			designatedSites: [1, 2, 3],
			doesAffectAListedBuilding: true,
			doesAffectAScheduledMonument: true,
			hasCompletedAnEnvironmentalStatement: true,
			hasProtectedSpecies: true,
			includesScreeningOption: true,
			incompleteReasons: [
				{
					id: 1,
					text: ['Incomplete reason 1', 'Incomplete reason 2', 'Incomplete reason 3']
				}
			],
			isConservationArea: true,
			isEnvironmentalStatementRequired: true,
			isGypsyOrTravellerSite: true,
			isListedBuilding: true,
			isPublicRightOfWay: true,
			isSensitiveArea: true,
			isTheSiteWithinAnAONB: true,
			lpaQuestionnaireDueDate: '2024-06-21',
			meetsOrExceedsThresholdOrCriteriaInColumn2: true,
			scheduleType: 1,
			sensitiveAreaDetails: 'The area is liable to flooding',
			validationOutcome: 'incomplete',
			isGreenBelt: true,
			preserveGrantLoan: true
		},
		UpdateLPAQuestionnaireResponse: {
			validationOutcome: {
				id: 11,
				name: 'Complete'
			}
		},
		AllAppellantCaseIncompleteReasonsResponse: [
			{
				id: 1,
				name: 'Incomplete reason',
				hasText: true
			}
		],
		AllAppellantCaseInvalidReasonsResponse: [
			{
				id: 1,
				name: 'Invalid reason',
				hasText: true
			}
		],
		AllLPAQuestionnaireIncompleteReasonsResponse: [
			{
				id: 1,
				name: 'Incomplete reason',
				hasText: true
			}
		],
		AllocationSpecialismsResponse: [
			{
				id: 1,
				name: 'Specialism'
			}
		],
		AllocationLevelsResponse: [
			{
				level: 'B',
				band: 3
			}
		],
		AppealAllocation: {
			level: 'A',
			specialisms: [70, 71, 72]
		},
		AllDesignatedSitesResponse: [
			{
				name: 'cSAC',
				description: 'candidate special area of conservation',
				id: 1
			}
		],
		AllKnowledgeOfOtherLandownersResponse: [
			{
				name: 'Yes',
				id: 1
			}
		],
		AllLPANotificationMethodsResponse: [
			{
				name: 'A site notice',
				key: 'notice',
				id: 1
			}
		],
		AllLPAQuestionnaireValidationOutcomesResponse: [
			{
				name: 'Complete',
				id: 1
			}
		],
		AllPlanningObligationStatusesResponse: [
			{
				name: 'Finalised',
				id: 1
			}
		],
		AllProcedureTypesResponse: [
			{
				name: 'Hearing',
				id: 1
			}
		],
		AllScheduleTypesResponse: [
			{
				name: 'Schedule 1',
				id: 1
			}
		],
		AllRepresentationRejectionReasonsResponse: [
			{
				id: 1,
				name: 'Rejection reason',
				hasText: true
			}
		],
		AllSiteVisitTypesResponse: [
			{
				name: 'Access required',
				id: 1
			}
		],
		AllAppellantCaseValidationOutcomesResponse: [
			{
				name: 'Valid',
				id: 1
			}
		],
		SingleAppellantResponse: {
			agentName: 'Fiona Burgess',
			appellantId: 1,
			company: 'Sophie Skinner Ltd',
			email: 'sophie.skinner@example.com',
			name: 'Sophie Skinner'
		},
		UpdateAppellantRequest: {
			name: 'Eva Sharma'
		},
		UpdateAppellantResponse: {
			name: 'Eva Sharma'
		},
		SingleAddressResponse: {
			addressId: 1,
			addressLine1: '1 Grove Cottage',
			addressLine2: 'Shotesham Road',
			country: 'United Kingdom',
			county: 'Devon',
			postcode: 'NR35 2ND',
			town: 'Woodton'
		},
		UpdateAddressRequest: {
			addressLine1: '1 Grove Cottage',
			addressLine2: 'Shotesham Road',
			country: 'United Kingdom',
			county: 'Devon',
			postcode: 'NR35 2ND',
			town: 'Woodton'
		},
		UpdateAddressResponse: {
			addressLine1: '1 Grove Cottage',
			addressLine2: 'Shotesham Road',
			country: 'United Kingdom',
			county: 'Devon',
			postcode: 'NR35 2ND',
			town: 'Woodton'
		},
		NeighbouringSiteCreateResponse: {
			siteId: 1,
			address: {
				addressLine1: '1 Grove Cottage',
				addressLine2: 'Shotesham Road',
				country: 'United Kingdom',
				county: 'Devon',
				postcode: 'NR35 2ND',
				town: 'Woodton'
			}
		},
		NeighbouringSiteUpdateRequest: {
			siteId: 1,
			address: {
				addressLine1: '1 Grove Cottage',
				addressLine2: 'Shotesham Road',
				country: 'United Kingdom',
				county: 'Devon',
				postcode: 'NR35 2ND',
				town: 'Woodton'
			}
		},
		NeighbouringSiteUpdateResponse: {
			siteId: 1
		},
		NeighbouringSiteDeleteRequest: {
			siteId: 1
		},
		UpdateAppealTimetableRequest: {
			finalCommentReviewDate: '2024-08-09',
			issueDeterminationDate: '2024-08-10',
			lpaQuestionnaireDueDate: '2024-08-11',
			statementReviewDate: '2024-08-12',
			statementOfCommonGroundDueDate: '2024-08-12',
			planningObligationDueDate: '2024-08-13',
			proofOfEvidenceAndWitnessesDueDate: '2024-08-14'
		},
		UpdateAppealTimetableResponse: {
			finalCommentReviewDate: '2024-08-09T01:00:00.000Z',
			issueDeterminationDate: '2024-08-10T01:00:00.000Z',
			lpaQuestionnaireDueDate: '2024-08-11T01:00:00.000Z',
			statementReviewDate: '2024-08-12T01:00:00.000Z',
			statementOfCommonGroundDueDate: '2024-08-12T01:00:00.000Z',
			planningObligationDueDate: '2024-08-13T01:00:00.000Z',
			proofOfEvidenceAndWitnessesDueDate: '2024-08-14T01:00:00.000Z'
		},
		CalculateAppealTimetableResponse: {
			finalCommentReviewDate: '2024-08-09T01:00:00.000Z',
			issueDeterminationDate: '2024-08-10T01:00:00.000Z',
			lpaQuestionnaireDueDate: '2024-08-11T01:00:00.000Z',
			statementReviewDate: '2024-08-12T01:00:00.000Z',
			statementOfCommonGroundDueDate: '2024-08-12T01:00:00.000Z',
			planningObligationDueDate: '2024-08-13T01:00:00.000Z',
			proofOfEvidenceAndWitnessesDueDate: '2024-08-14T01:00:00.000Z',
			startDate: '2024-08-09T01:00:00.000Z'
		},
		AllDocumentRedactionStatusesResponse: {
			id: 1,
			name: 'Document redaction status'
		},
		UpdateDocumentsRequest: {
			documents: [
				{
					id: '987e66e0-1db4-404b-8213-8082919159e9',
					receivedDate: '2024-09-23',
					redactionStatus: 1
				}
			]
		},
		UpdateDocumentsResponse: {
			documents: [
				{
					id: '987e66e0-1db4-404b-8213-8082919159e9',
					receivedDate: '2024-09-23',
					redactionStatus: 1
				}
			]
		},
		UpdateDocumentFileNameRequest: {
			id: '987e66e0-1db4-404b-8213-8082919159e9',
			fileName: 'renamed-document.pdf'
		},
		UpdateDocumentFileNameResponse: {
			id: '987e66e0-1db4-404b-8213-8082919159e9',
			fileName: 'renamed-document.pdf'
		},
		UpdateDocumentsAvCheckRequest: {
			documents: [
				{
					id: '987e66e0-1db4-404b-8213-8082919159e9',
					version: 1,
					virusCheckStatus: 'scanned'
				}
			]
		},
		UpdateDocumentsAvCheckResponse: {
			documents: [
				{
					id: '987e66e0-1db4-404b-8213-8082919159e9',
					version: 1,
					virusCheckStatus: 'scanned'
				}
			]
		},
		GetAuditTrailsResponse: [
			{
				azureAdUserId: 'f7ea429b-65d8-4c44-8fc2-7f1a34069855',
				details: 'The case officer 13de469c-8de6-4908-97cd-330ea73df618 was added to the team',
				loggedDate: '2024-09-26T16:22:20.688Z'
			}
		],
		RepRejectionReasonsUpdateRequest: {
			rejectionReasons: [
				{
					id: 1,
					text: []
				},
				{
					id: 7,
					text: ['Illegible or Incomplete Documentation', 'Previously Decided or Duplicate Appeal']
				}
			]
		},
		LPAs: [
			{
				id: 1,
				name: 'Bristol City Council',
				lpaCode: 'BRIS',
				email: 'bris@lpa-email.gov.uk'
			}
		],
		LPAChangeRequest: {
			newLpaId: 2
		},

		UpdateAsssignedTeamResponse: {
			teamId: 1
		},
		TeamEmailResponse: {
			teamEmail: 'email@email.com'
		}
	},
	'@definitions': {
		SingleLinkableAppealSummaryResponse: {
			type: 'object',
			properties: {
				appealId: {
					type: 'string',
					description: 'ID in back-office or horizon',
					example: '12345'
				},
				appealReference: {
					type: 'string',
					description: 'Horizon or Back Office appeal reference',
					example: '3000359'
				},
				appealType: {
					type: 'string',
					description: 'Type of appeal',
					example: 'Planning Appeal (W)'
				},
				appealStatus: {
					type: 'string',
					description: 'Status of appeal',
					example: 'Decision Issued'
				},
				siteAddress: {
					type: 'object',
					properties: {
						siteAddressLine1: {
							type: 'string',
							description: 'First line of site address',
							example: '123 Main Street'
						},
						siteAddressLine2: {
							type: 'string',
							description: 'Second line of site address',
							example: 'Brentry'
						},
						siteAddressTown: {
							type: 'string',
							description: 'Site town',
							example: 'Bristol'
						},
						siteAddressCounty: {
							type: 'string',
							description: 'Site county',
							example: 'Bristol, city of'
						},
						siteAddressPostcode: {
							type: 'string',
							description: 'Site postcode',
							example: 'BS1 1AA'
						}
					}
				},
				localPlanningDepartment: {
					type: 'string',
					description: 'Name of Local Planning Department',
					example: 'Bristol City Council'
				},
				appellantName: {
					type: 'string',
					description: 'Full name of the appellant',
					example: 'Mr John Wick'
				},
				agentName: {
					type: 'string',
					description: 'Name of the agent',
					example: 'Mr John Smith (Smith Planning Agency)'
				},
				submissionDate: {
					type: 'string',
					description: 'Date string of the submission: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2014-11-14T00:00:00+00:00'
				},
				source: {
					type: 'string',
					description: 'Information origin (back-office or horizon)',
					example: 'horizon'
				}
			}
		},
		ExistsOnHorizonResponse: {
			type: 'object',
			properties: {
				caseFound: {
					type: 'boolean',
					description: 'Case found status in Horizon',
					example: true
				}
			}
		},
		SiteVisitCreateRequest: {
			type: 'object',
			required: ['visitType', 'visitDate'],
			properties: {
				visitDate: {
					type: 'string',
					format: 'date-time',
					example: '2024-08-24T00:00:00Z'
				},
				visitStartTime: {
					type: 'string',
					format: 'date-time',
					example: '2024-08-24T10:30:00Z'
				},
				visitEndTime: {
					type: 'string',
					format: 'date-time',
					example: '2024-08-24T11:30:00Z'
				},
				visitType: {
					type: 'string',
					enum: [
						SITE_VISIT_TYPE_UNACCOMPANIED,
						SITE_VISIT_TYPE_ACCESS_REQUIRED,
						SITE_VISIT_TYPE_ACCOMPANIED
					]
				}
			}
		},
		SiteVisitUpdateRequest: {
			allOf: [
				{ $ref: '#/components/schemas/SiteVisitCreateRequest' },
				{
					type: 'object',
					properties: {
						previousVisitType: {
							type: 'string',
							enum: [
								SITE_VISIT_TYPE_UNACCOMPANIED,
								SITE_VISIT_TYPE_ACCESS_REQUIRED,
								SITE_VISIT_TYPE_ACCOMPANIED
							]
						},
						siteVisitChangeType: {
							type: 'string',
							enum: ['unchanged', 'date-time', 'visit-type', 'all']
						}
					}
				}
			]
		},
		SiteVisitSingleResponse: {
			allOf: [
				{ $ref: '#/components/schemas/SiteVisitCreateRequest' },
				{
					type: 'object',
					required: ['appealId', 'siteVisitId'],
					properties: {
						appealId: {
							type: 'number'
						},
						siteVisitId: {
							type: 'number'
						}
					}
				}
			]
		},
		MissedSiteVisitRequest: {
			type: 'object',
			required: ['whoMissedSiteVisit'],
			properties: {
				whoMissedSiteVisit: {
					type: 'string'
				}
			}
		},
		UpdateServiceUserRequest: {
			type: 'object',
			properties: {
				serviceUser: {
					type: 'object',
					properties: {
						serviceUserId: {
							type: 'number',
							required: true,
							description: 'ID in back-office',
							example: 12345
						},
						userType: {
							type: 'string',
							required: true,
							description: 'Type of user',
							example: 'agent'
						},
						organisationName: {
							type: 'string',
							required: false,
							description: "User's organisation (optional)",
							example: 'Planning Support LTD'
						},
						firstName: {
							type: 'string',
							required: true,
							description: "User's first name",
							example: 'Harry'
						},
						middleName: {
							type: 'string',
							required: false,
							description: "User's middle name (optional)",
							example: 'James'
						},
						lastName: {
							type: 'string',
							required: true,
							description: "User's last name",
							example: 'Potter'
						},
						email: {
							type: 'string',
							required: false,
							description: "User's email address (optional)",
							example: 'harry.potter@magic.com'
						},
						phoneNumber: {
							type: 'string',
							required: false,
							description: "User's phone number (optional)",
							example: '01179123456'
						},
						addressId: {
							type: 'number',
							required: false,
							description: "User's addressId in back-office (optional)",
							example: 13
						}
					}
				}
			}
		},
		UpdateServiceUserResponse: {
			type: 'object',
			properties: {
				serviceUserId: {
					type: 'number',
					example: 1
				}
			}
		},
		DeleteServiceUserRequest: {
			type: 'object',
			properties: {
				userType: {
					type: 'string',
					example: 'agent'
				}
			}
		},
		DeleteServiceUserResponse: {
			type: 'object',
			properties: {
				serviceUserId: {
					type: 'number',
					example: 1
				}
			}
		},
		WithdrawalRequestRequest: {
			type: 'object',
			properties: {
				withdrawalRequestDate: {
					type: 'string',
					example: '2024-10-11'
				}
			}
		},
		EiaScreeningRequiredRequest: {
			type: 'object',
			properties: {
				eiaScreeningRequired: {
					type: 'boolean',
					example: true
				}
			}
		},
		CreateHearingRequest: {
			type: 'object',
			properties: {
				hearingStartTime: {
					type: 'string',
					description: 'Date string of the hearing start time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				hearingEndTime: {
					type: 'string',
					description: 'Date string of the hearing end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				addressId: {
					type: 'number',
					example: 1
				},
				address: {
					type: 'object',
					properties: {
						addressLine1: {
							type: 'string',
							example: '1 Grove Cottage'
						},
						addressLine2: {
							type: 'string',
							example: 'Shotesham Road'
						},
						country: {
							type: 'string',
							example: 'United Kingdom'
						},
						county: {
							type: 'string',
							example: 'Devon'
						},
						postcode: {
							type: 'string',
							example: 'NR35 2ND'
						},
						town: {
							type: 'string',
							example: 'Woodton'
						}
					}
				}
			}
		},
		UpdateHearingRequest: {
			type: 'object',
			properties: {
				hearingStartTime: {
					type: 'string',
					description: 'Date string of the hearing start time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				hearingEndTime: {
					type: 'string',
					description: 'Date string of the hearing end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				addressId: {
					type: 'number',
					example: 1
				},
				address: {
					type: 'object',
					properties: {
						addressLine1: {
							type: 'string',
							example: '1 Grove Cottage'
						},
						addressLine2: {
							type: 'string',
							example: 'Shotesham Road'
						},
						country: {
							type: 'string',
							example: 'United Kingdom'
						},
						county: {
							type: 'string',
							example: 'Devon'
						},
						postcode: {
							type: 'string',
							example: 'NR35 2ND'
						},
						town: {
							type: 'string',
							example: 'Woodton'
						}
					}
				}
			}
		},
		HearingResponse: {
			type: 'object',
			properties: {
				appealId: {
					type: 'number',
					example: 1
				},
				hearingId: {
					type: 'number',
					example: 1
				},
				hearingStartTime: {
					type: 'string',
					description: 'Date string of the hearing start time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2014-11-14T00:00:00+00:00'
				},
				hearingEndTime: {
					type: 'string',
					description: 'Date string of the hearing end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2014-11-14T00:00:00+00:00'
				},
				addressId: {
					type: 'number',
					example: 1
				},
				address: {
					type: 'object',
					properties: {
						addressLine1: {
							type: 'string',
							example: '1 Grove Cottage'
						},
						addressLine2: {
							type: 'string',
							example: 'Shotesham Road'
						},
						country: {
							type: 'string',
							example: 'United Kingdom'
						},
						county: {
							type: 'string',
							example: 'Devon'
						},
						postcode: {
							type: 'string',
							example: 'NR35 2ND'
						},
						town: {
							type: 'string',
							example: 'Woodton'
						}
					}
				}
			}
		},
		HearingEstimate: {
			type: 'object',
			properties: {
				preparationTime: {
					type: 'number',
					example: 1.5
				},
				sittingTime: {
					type: 'number',
					example: 0.5
				},
				reportingTime: {
					type: 'number',
					example: 2
				}
			}
		},
		HearingEstimateCreateRequest: {
			type: 'object',
			properties: {
				preparationTime: {
					type: 'number',
					example: 1.5
				},
				sittingTime: {
					type: 'number',
					example: 0.5
				},
				reportingTime: {
					type: 'number',
					example: 2
				}
			}
		},
		HearingEstimateUpdateRequest: {
			type: 'object',
			properties: {
				preparationTime: {
					type: 'number',
					example: 1.5
				},
				sittingTime: {
					type: 'number',
					example: 0.5
				},
				reportingTime: {
					type: 'number',
					example: 2
				}
			}
		},
		HearingEstimateResponse: {
			type: 'object',
			properties: {
				hearingEstimateId: {
					type: 'number',
					example: 1
				}
			}
		},
		CancelHearing: {
			type: 'object',
			properties: {
				appealId: {
					type: 'number',
					example: 1
				},
				hearingId: {
					type: 'number',
					example: 1
				}
			}
		},
		ChangeProcedureTypeRequest: {
			type: 'object',
			properties: {
				appealProcedure: {
					type: 'string',
					description: 'Appeal procedure type',
					example: 'hearing'
				},
				existingAppealProcedure: {
					type: 'string',
					description: 'Existing appeal procedure type',
					example: 'hearing'
				},
				eventDate: {
					type: 'string',
					description: 'Date string of the event date and time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				estimatedDays: {
					type: 'string',
					description: 'Estimated number of days',
					example: 5
				},
				lpaQuestionnaireDueDate: {
					type: 'string',
					description: 'Date string of the lpaQuestionnaireDueDate: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				statementDueDate: {
					type: 'string',
					description: 'Date string of the statementDueDate: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				ipCommentsDueDate: {
					type: 'string',
					description: 'Date string of the ipCommentsDueDate: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				finalCommentsDueDate: {
					type: 'string',
					description: 'Date string of the finalCommentsDueDate: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				statementOfCommonGroundDueDate: {
					type: 'string',
					description:
						'Date string of the statementOfCommonGroundDueDate: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				proofOfEvidenceAndWitnessesDueDate: {
					type: 'string',
					description:
						'Date string of the proofOfEvidenceAndWitnessesDueDate: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				planningObligationDueDate: {
					type: 'string',
					description: 'Date string of the planningObligationDueDate: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				address: {
					type: 'object',
					properties: {
						addressLine1: {
							type: 'string',
							example: '1 Grove Cottage'
						},
						addressLine2: {
							type: 'string',
							example: 'Shotesham Road'
						},
						country: {
							type: 'string',
							example: 'United Kingdom'
						},
						county: {
							type: 'string',
							example: 'Devon'
						},
						postcode: {
							type: 'string',
							example: 'NR35 2ND'
						},
						town: {
							type: 'string',
							example: 'Woodton'
						}
					}
				}
			}
		},
		CreateInquiryRequest: {
			type: 'object',
			properties: {
				inquiryStartTime: {
					type: 'string',
					description: 'Date string of the inquiry start time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				inquiryEndTime: {
					type: 'string',
					description: 'Date string of the inquiry end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				startDate: {
					type: 'string',
					description: 'Date string of the timetable: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				estimatedDays: {
					type: 'string',
					description: 'Estimated number of days',
					example: '5'
				},
				lpaQuestionnaireDueDate: {
					type: 'string',
					description: 'Date string of the inquiry end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				statementDueDate: {
					type: 'string',
					description: 'Date string of the inquiry end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				ipCommentsDueDate: {
					type: 'string',
					description: 'Date string of the inquiry end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				statementOfCommonGroundDueDate: {
					type: 'string',
					description: 'Date string of the inquiry end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				proofOfEvidenceAndWitnessesDueDate: {
					type: 'string',
					description: 'Date string of the inquiry end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				planningObligationDueDate: {
					type: 'string',
					description: 'Date string of the inquiry end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				address: {
					type: 'object',
					properties: {
						addressLine1: {
							type: 'string',
							example: '1 Grove Cottage'
						},
						addressLine2: {
							type: 'string',
							example: 'Shotesham Road'
						},
						country: {
							type: 'string',
							example: 'United Kingdom'
						},
						county: {
							type: 'string',
							example: 'Devon'
						},
						postcode: {
							type: 'string',
							example: 'NR35 2ND'
						},
						town: {
							type: 'string',
							example: 'Woodton'
						}
					}
				}
			}
		},
		UpdateInquiryRequest: {
			type: 'object',
			properties: {
				inquiryStartTime: {
					type: 'string',
					description: 'Date string of the inquiry start time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				inquiryEndTime: {
					type: 'string',
					description: 'Date string of the inquiry end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2026-11-10T00:00:00.000Z'
				},
				addressId: {
					type: 'number',
					description: 'Address ID of the inquiry',
					example: 1
				},
				address: {
					type: 'object',
					properties: {
						addressLine1: {
							type: 'string',
							example: '1 Grove Cottage'
						},
						addressLine2: {
							type: 'string',
							example: 'Shotesham Road'
						},
						country: {
							type: 'string',
							example: 'United Kingdom'
						},
						county: {
							type: 'string',
							example: 'Devon'
						},
						postcode: {
							type: 'string',
							example: 'NR35 2ND'
						},
						town: {
							type: 'string',
							example: 'Woodton'
						}
					}
				},
				estimatedDays: {
					type: 'number',
					description: 'Number of estimated days for the inquiry',
					example: 1
				}
			}
		},
		CancelInquiry: {
			type: 'object',
			properties: {
				appealId: {
					type: 'number',
					example: 1
				},
				inquiryId: {
					type: 'number',
					example: 1
				}
			}
		},
		InquiryResponse: {
			type: 'object',
			properties: {
				appealId: {
					type: 'number',
					example: 1
				},
				inquiryId: {
					type: 'number',
					example: 1
				},
				inquiryStartTime: {
					type: 'string',
					description: 'Date string of the inquiry start time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2014-11-14T00:00:00+00:00'
				},
				inquiryEndTime: {
					type: 'string',
					description: 'Date string of the inquiry end time: YYYY-MM-DDTHH:MM:SS+HH:MM',
					example: '2014-11-14T00:00:00+00:00'
				},
				estimatedDays: {
					type: 'number',
					description: 'Estimated number of days',
					example: 5
				},
				addressId: {
					type: 'number',
					example: 1
				},
				address: {
					type: 'object',
					properties: {
						addressLine1: {
							type: 'string',
							example: '1 Grove Cottage'
						},
						addressLine2: {
							type: 'string',
							example: 'Shotesham Road'
						},
						country: {
							type: 'string',
							example: 'United Kingdom'
						},
						county: {
							type: 'string',
							example: 'Devon'
						},
						postcode: {
							type: 'string',
							example: 'NR35 2ND'
						},
						town: {
							type: 'string',
							example: 'Woodton'
						}
					}
				}
			}
		},
		InquiryEstimate: {
			type: 'object',
			properties: {
				preparationTime: {
					type: 'number',
					example: 1.5
				},
				sittingTime: {
					type: 'number',
					example: 0.5
				},
				reportingTime: {
					type: 'number',
					example: 2
				}
			}
		},
		InquiryEstimateCreateRequest: {
			type: 'object',
			properties: {
				preparationTime: {
					type: 'number',
					example: 1.5
				},
				sittingTime: {
					type: 'number',
					example: 0.5
				},
				reportingTime: {
					type: 'number',
					example: 2
				}
			}
		},
		InquiryEstimateUpdateRequest: {
			type: 'object',
			properties: {
				preparationTime: {
					type: 'number',
					example: 1.5
				},
				sittingTime: {
					type: 'number',
					example: 0.5
				},
				reportingTime: {
					type: 'number',
					example: 2
				}
			}
		},
		InquiryEstimateResponse: {
			type: 'object',
			properties: {
				inquiryEstimateId: {
					type: 'number',
					example: 1
				}
			}
		},
		AppealStatusRollBackRequest: {
			type: 'object',
			properties: {
				status: {
					type: 'string',
					example: 'event'
				}
			}
		},
		UpdateAsssignedTeamRequest: {
			type: 'object',
			properties: {
				teamId: {
					type: 'string',
					example: '1'
				}
			}
		},
		DeleteAppealsRequest: {
			type: 'object',
			properties: {
				appealIds: {
					type: 'array',
					items: {
						type: 'number'
					}
				}
			}
		},
		...ApiDefinitions
	},
	components: {}
};
