import { APPEAL_REDACTED_STATUS, APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';
import { sample } from 'lodash-es';

export const localPlanningDepartments = [
	'Maidstone Borough Council',
	'Barnsley Metropolitan Borough Council',
	'Worthing Borough Council',
	'Dorset Council',
	'Basingstoke and Deane Borough Council',
	'Wiltshire Council',
	'Waveney District Council',
	'Bristol City Council'
];

export const appealsNationalList = {
	itemCount: 2,
	items: [
		{
			appealId: 1,
			appealReference: 'APP/Q9999/D/21/943245',
			appealSite: {
				addressLine1: 'Copthalls',
				addressLine2: 'Clevedon Road',
				town: 'West Hill',
				postCode: 'BS48 1PN'
			},
			appealStatus: 'lpa_questionnaire',
			appealType: 'Householder',
			createdAt: '2023-04-17T09:49:22.021Z',
			localPlanningDepartment: 'Wiltshire Council',
			appellantCaseStatus: '',
			lpaQuestionnaireStatus: '',
			dueDate: null,
			isParentAppeal: false,
			isChildAppeal: false
		},
		{
			appealId: 2,
			appealReference: 'APP/Q9999/D/21/129285',
			appealSite: {
				addressLine1: '19 Beauchamp Road',
				town: 'Bristol',
				postCode: 'BS7 8LQ'
			},
			appealStatus: 'issue_determination',
			appealType: 'Householder',
			createdAt: '2023-04-17T09:49:22.057Z',
			localPlanningDepartment: 'Dorset Council',
			appellantCaseStatus: '',
			lpaQuestionnaireStatus: '',
			dueDate: null,
			isParentAppeal: false,
			isChildAppeal: false
		}
	],
	statuses: [
		'assign_case_officer',
		'ready_to_start',
		'lpa_questionnaire',
		'issue_determination',
		'complete'
	],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

/**
 * @type {import('../../../src/server/appeals/appeal-details/appeal-details.types.d').WebAppeal}
 */
export const appealData = {
	allocationDetails: {
		level: 'A',
		band: 3,
		specialisms: ['Historic heritage', 'Architecture design']
	},
	appealId: 1,
	appealReference: 'APP/Q9999/D/21/351062',
	appealSite: {
		addressId: 1,
		addressLine1: '21 The Pavement',
		county: 'Wandsworth',
		postCode: 'SW4 0HY'
	},
	appealStatus: 'received_appeal',
	appealTimetable: {
		appealTimetableId: 1053,
		lpaQuestionnaireDueDate: '2023-10-11T01:00:00.000Z'
	},
	appealType: 'Householder',
	appellantCaseId: 0,
	agent: {
		serviceUserId: 1,
		firstName: 'Fiona',
		lastName: 'Shell',
		email: 'test2@example.com'
	},
	appellant: {
		serviceUserId: 2,
		firstName: 'Roger',
		lastName: 'Simmons',
		email: 'test3@example.com'
	},
	caseOfficer: null,
	costs: {
		appellantApplicationFolder: {
			caseId: '1',
			folderId: 1,
			path: 'costs/appellantCostsApplication',
			documents: []
		},
		appellantWithdrawalFolder: {
			caseId: '1',
			folderId: 2,
			path: 'costs/appellantCostsWithdrawal',
			documents: []
		},
		appellantCorrespondenceFolder: {
			caseId: '1',
			folderId: 3,
			path: 'costs/appellantCostsCorrespondence',
			documents: []
		},
		lpaApplicationFolder: {
			caseId: '1',
			folderId: 4,
			path: 'costs/lpaCostsApplication',
			documents: []
		},
		lpaWithdrawalFolder: {
			caseId: '1',
			folderId: 5,
			path: 'costs/lpaCostsWithdrawal',
			documents: []
		},
		lpaCorrespondenceFolder: {
			caseId: '1',
			folderId: 6,
			path: 'costs/lpaCostsCorrespondence',
			documents: []
		},
		decisionFolder: {
			caseId: '1',
			folderId: 7,
			path: 'costs/costsDecisionLetter',
			documents: []
		}
	},
	decision: {
		folderId: 123,
		outcome: 'dismissed',
		documentId: 'e1e90a49-fab3-44b8-a21a-bb73af089f6b',
		letterDate: new Date('2023-12-25T00:00:00.000Z')
	},
	internalCorrespondence: {
		crossTeam: {
			caseId: '1',
			folderId: 10,
			path: 'internal/crossTeam',
			documents: []
		},
		inspector: {
			caseId: '1',
			folderId: 11,
			path: 'internal/inspector',
			documents: []
		}
	},
	healthAndSafety: {
		appellantCase: {
			details: 'Dogs on site',
			hasIssues: true
		},
		lpaQuestionnaire: {
			details: null,
			hasIssues: false
		}
	},
	inspector: null,
	inspectorAccess: {
		appellantCase: {
			details: null,
			isRequired: false
		},
		lpaQuestionnaire: {
			details: null,
			isRequired: false
		}
	},
	isParentAppeal: false,
	isChildAppeal: false,
	linkedAppeals: [],
	localPlanningDepartment: 'Wiltshire Council',
	lpaQuestionnaireId: 1,
	withdrawal: {
		withdrawalFolder: {
			caseId: '25',
			documents: [],
			folderId: 437,
			path: 'appellant-case/appellantCaseWithdrawalLetter'
		},
		withdrawalRequestDate: null
	},
	neighbouringSites: [
		{
			siteId: 1,
			source: 'lpa',
			address: {
				addressLine1: '1 Grove Cottage',
				addressLine2: 'Shotesham Road',
				town: 'Woodton',
				county: 'Devon',
				postCode: 'NR35 2ND'
			}
		},
		{
			siteId: 2,
			source: 'back-office',
			address: {
				addressLine1: '2 Grove Cottage',
				addressLine2: 'Shotesham Road',
				town: 'Woodton',
				county: 'Devon',
				postCode: 'NR35 2ND'
			}
		}
	],
	otherAppeals: [],
	planningApplicationReference: '48269/APP/2021/1482',
	procedureType: 'Written',
	siteVisit: {
		siteVisitId: 0,
		visitDate: '2023-10-09T01:00:00.000Z',
		visitEndTime: '10:44',
		visitStartTime: '09:38',
		visitType: 'Accompanied'
	},
	createdAt: '2023-05-21T10:27:06.626Z',
	startedAt: '2023-05-23T10:27:06.626Z',
	validAt: '2023-05-23T10:27:06.626Z',
	documentationSummary: {
		appellantCase: {
			status: 'received',
			dueDate: '2024-10-02T10:27:06.626Z',
			receivedAt: '2024-08-02T10:27:06.626Z'
		},
		lpaQuestionnaire: {
			status: 'not_received',
			dueDate: '2024-10-11T10:27:06.626Z',
			receivedAt: '2024-08-02T10:27:06.626Z'
		}
	}
};

export const appealDataFullPlanning = {
	...appealData,
	appealType: 'Planning appeal'
};

export const appellantCaseDataNotValidated = {
	appealId: 1,
	appealReference: 'TEST/919276',
	appealSite: {
		addressId: 1,
		addressLine1: '96 The Avenue',
		addressLine2: 'Maidstone',
		county: 'Kent',
		postCode: 'MD21 5XY'
	},
	appellantCaseId: 1,
	appellant: {
		firstName: 'Fiona',
		surname: 'Burgess'
	},
	applicant: {
		firstName: null,
		surname: null
	},
	planningApplicationReference: '48269/APP/2021/1482',
	documents: {
		appellantCaseCorrespondence: {
			documents: [
				{
					id: '00c43c8c-829a-4aa8-883a-fd6fc1f52c3d',
					name: 'ph1.jpeg',
					folderId: 3420,
					caseId: 111,
					isLateEntry: true,
					latestDocumentVersion: {
						blobStorageContainer: 'document-service-uploads',
						blobStoragePath: 'appeal/6000111/115fbb69-b485-45c6-abd2-341e43139582/v1/ph1.jpeg',
						dateReceived: '2024-06-19T00:00:00.000Z',
						documentId: '115fbb69-b485-45c6-abd2-341e43139582',
						documentType: 'appellantCaseCorrespondence',
						documentURI:
							'https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/appeal/6000035/115fbb69-b485-45c6-abd2-341e43139582/v1/ph1.jpeg',
						fileName: 'ph1.jpeg',
						isDeleted: false,
						isLateEntry: false,
						mime: 'image/jpeg',
						originalFilename: 'ph1.jpeg',
						redactionStatus: 'Unredacted',
						size: '58861',
						stage: 'appellant-case',
						version: 1,
						virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED
					}
				},
				{
					id: 'a78446aa-167a-4bef-89b7-18bcb0da11c1',
					name: 'ph0.jpeg',
					folderId: 3420,
					caseId: 111,
					isLateEntry: false,
					latestDocumentVersion: {
						blobStorageContainer: 'document-service-uploads',
						blobStoragePath: 'appeal/6000111/115fbb69-b485-45c6-abd2-341e43139582/v1/ph0.jpeg',
						dateReceived: '2024-06-19T00:00:00.000Z',
						documentId: '115fbb69-b485-45c6-abd2-341e43139582',
						documentType: 'appellantCaseCorrespondence',
						documentURI:
							'https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/appeal/6000035/115fbb69-b485-45c6-abd2-341e43139582/v1/ph0.jpeg',
						fileName: 'ph0.jpeg',
						isDeleted: false,
						isLateEntry: false,
						mime: 'image/jpeg',
						originalFilename: 'ph0.jpeg',
						redactionStatus: 'Unredacted',
						size: '58861',
						stage: 'appellant-case',
						version: 1,
						virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED
					}
				}
			],
			folderId: 70461,
			path: 'appellant-case/appellantCaseCorrespondence'
		},
		appellantCaseWithdrawalLetter: {
			documents: [],
			folderId: 70460,
			path: 'appellant-case/appellantCaseWithdrawalLetter'
		},
		appellantStatement: {
			documents: [],
			folderId: 70456,
			path: 'appellant-case/appellantStatement'
		},
		applicationDecisionLetter: {
			documents: [],
			folderId: 70458,
			path: 'appellant-case/applicationDecisionLetter'
		},
		changedDescription: {
			documents: [],
			folderId: 70459,
			path: 'appellant-case/changedDescription'
		},
		originalApplicationForm: {
			documents: [],
			folderId: 70457,
			path: 'appellant-case/originalApplicationForm'
		}
	},
	hasAdvertisedAppeal: null,
	healthAndSafety: {
		details: null,
		hasIssues: false
	},
	isAppellantNamedOnApplication: true,
	localPlanningDepartment: 'Worthing Borough Council',
	siteOwnership: {
		areAllOwnersKnown: null,
		hasAttemptedToIdentifyOwners: null,
		hasToldOwners: null,
		ownsAllLand: true,
		ownsSomeLand: null,
		knowsOtherLandowners: null
	},
	siteAreaSquareMetres: '30.1',
	validation: null,
	visibility: {
		details: null,
		isVisible: true
	}
};

export const lpaQuestionnaireData = {
	affectsListedBuildingDetails: [
		{
			listEntry: '123456'
		}
	],
	appealId: 1,
	appealReference: 'APP/Q9999/D/21/30498',
	appealSite: {
		addressLine1: '92 Huntsmoor Road',
		town: 'Tadley',
		postCode: 'RG26 4BX'
	},
	communityInfrastructureLevyAdoptionDate: '2023-05-09T01:00:00.000Z',
	designatedSites: [
		{
			name: 'pSPA',
			description: 'potential special protection area'
		},
		{
			name: 'SAC',
			description: 'special area of conservation'
		}
	],
	developmentDescription: '',
	documents: {
		conservationAreaMap: {
			folderId: 1,
			path: 'lpa_questionnaire/conservationAreaMap',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56a',
					name: 'conservationAreaMap.docx',
					folderId: 1,
					caseId: 1
				}
			]
		},
		notifyingParties: {
			folderId: 2,
			path: 'lpa_questionnaire/notifyingParties',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56b',
					name: 'notifyingParties.docx',
					folderId: 2,
					caseId: 1
				}
			]
		},
		siteNotices: {
			folderId: 3,
			path: 'lpa_questionnaire/siteNotices',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56c',
					name: 'siteNotices.docx',
					folderId: 3,
					caseId: 1
				}
			]
		},
		lettersToNeighbours: {
			folderId: 4,
			path: 'lpa_questionnaire/lettersToNeighbours',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56d',
					name: 'lettersToNeighbours.docx',
					folderId: 4,
					caseId: 1
				}
			]
		},
		pressAdvert: {
			folderId: 5,
			path: 'lpa_questionnaire/pressAdvert',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56e',
					name: 'pressAdvert.docx',
					folderId: 5,
					caseId: 1
				}
			]
		},
		representations: {
			folderId: 6,
			path: 'lpa_questionnaire/representations',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56f',
					name: 'representations.docx',
					folderId: 6,
					caseId: 1
				}
			]
		},
		officersReport: {
			folderId: 7,
			path: 'lpa_questionnaire/officersReport',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56g',
					name: 'officersReport.docx',
					folderId: 7,
					caseId: 1
				}
			]
		},
		communityInfrastructureLevy: {
			folderId: 8,
			path: 'lpa_questionnaire/communityInfrastructureLevy',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56h',
					name: 'communityInfrastructureLevy.docx',
					folderId: 8,
					caseId: 1
				}
			]
		},
		consultationResponses: {
			folderId: 9,
			path: 'lpa_questionnaire/consultationResponses',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56i',
					name: 'consultationResponses.docx',
					folderId: 9,
					caseId: 1
				}
			]
		},
		definitiveMapAndStatement: {
			folderId: 10,
			path: 'lpa_questionnaire/definitiveMapAndStatement',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56j',
					name: 'definitiveMapAndStatement.docx',
					folderId: 10,
					caseId: 1
				}
			]
		},
		emergingPlans: {
			folderId: 11,
			path: 'lpa_questionnaire/emergingPlans',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56k',
					name: 'emergingPlans.docx',
					folderId: 11,
					caseId: 1
				}
			]
		},
		environmentalStatementResponses: {
			folderId: 12,
			path: 'lpa_questionnaire/environmentalStatementResponses',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56l',
					name: 'environmentalStatementResponses.docx',
					folderId: 12,
					caseId: 1
				}
			]
		},
		issuedScreeningOption: {
			folderId: 13,
			path: 'lpa_questionnaire/issuedScreeningOption',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56m',
					name: 'issuedScreeningOption.docx',
					folderId: 13,
					caseId: 1
				}
			]
		},
		otherRelevantPolicies: {
			folderId: 14,
			path: 'lpa_questionnaire/otherRelevantPolicies',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56n',
					name: 'otherRelevantPolicies.docx',
					folderId: 14,
					caseId: 1
				}
			]
		},
		policiesFromStatutoryDevelopment: {
			folderId: 15,
			path: 'lpa_questionnaire/policiesFromStatutoryDevelopment',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56o',
					name: 'policiesFromStatutoryDevelopment.docx',
					folderId: 15,
					caseId: 1
				}
			]
		},
		relevantPartiesNotification: {
			folderId: 16,
			path: 'lpa_questionnaire/relevantPartiesNotification',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56p',
					name: 'relevantPartiesNotification.docx',
					folderId: 16,
					caseId: 1
				}
			]
		},
		responsesOrAdvice: {
			folderId: 17,
			path: 'lpa_questionnaire/responsesOrAdvice',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56q',
					name: 'responsesOrAdvice.docx',
					folderId: 17,
					caseId: 1
				}
			]
		},
		screeningDirection: {
			folderId: 18,
			path: 'lpa_questionnaire/screeningDirection',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56r',
					name: 'screeningDirection.docx',
					folderId: 18,
					caseId: 1
				}
			]
		},
		supplementaryPlanningDocuments: {
			folderId: 19,
			path: 'lpa_questionnaire/supplementaryPlanningDocuments',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56s',
					name: 'supplementaryPlanningDocuments.docx',
					folderId: 19,
					caseId: 1
				}
			]
		},
		treePreservationOrder: {
			folderId: 20,
			path: 'lpa_questionnaire/treePreservationOrder',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56t',
					name: 'treePreservationOrder.docx',
					folderId: 20,
					caseId: 1
				}
			]
		},
		additionalDocuments: {
			folderId: 21,
			path: 'lpa_questionnaire/additionalDocuments',
			documents: [
				{
					id: '00c43c8c-829a-4aa8-883a-fd6fc1f52c3d',
					name: 'ph1.jpeg',
					folderId: 3420,
					caseId: 111,
					isLateEntry: true,
					virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED
				},
				{
					id: 'a78446aa-167a-4bef-89b7-18bcb0da11c1',
					name: 'ph0.jpeg',
					folderId: 3420,
					caseId: 111,
					isLateEntry: false,
					virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED
				},
				{
					id: 'a78446aa-167a-4bef-89b7-18bcb0da11c2',
					name: 'test-doc.jpeg',
					folderId: 3420,
					caseId: 111,
					isLateEntry: false,
					virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED
				}
			]
		}
	},
	doesAffectAListedBuilding: true,
	doesAffectAScheduledMonument: true,
	doesSiteHaveHealthAndSafetyIssues: true,
	doesSiteRequireInspectorAccess: true,
	extraConditions: 'Some extra conditions',
	hasCommunityInfrastructureLevy: true,
	hasCompletedAnEnvironmentalStatement: true,
	hasEmergingPlan: true,
	hasExtraConditions: true,
	hasOtherAppeals: null,
	hasProtectedSpecies: true,
	hasRepresentationsFromOtherParties: true,
	hasResponsesOrStandingAdviceToUpload: true,
	hasStatementOfCase: true,
	hasStatutoryConsultees: true,
	hasSupplementaryPlanningDocuments: true,
	hasTreePreservationOrder: true,
	healthAndSafetyDetails: 'There is no mobile signal at the property',
	inCAOrrelatesToCA: true,
	includesScreeningOption: true,
	inquiryDays: 2,
	inspectorAccessDetails: 'The entrance is at the back of the property',
	isAffectingNeighbouringSites: true,
	isCommunityInfrastructureLevyFormallyAdopted: true,
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
		},
		{
			listEntry: '123457'
		}
	],
	localPlanningDepartment: 'Dorset Council',
	lpaNotificationMethods: [
		{
			name: 'A site notice'
		},
		{
			name: 'Letter/email to interested parties'
		}
	],
	lpaQuestionnaireId: 2,
	meetsOrExceedsThresholdOrCriteriaInColumn2: true,
	otherAppeals: [
		{
			appealId: 2,
			appealReference: 'APP/Q9999/D/21/725284'
		}
	],
	procedureType: 'Written',
	scheduleType: 'Schedule 2',
	sensitiveAreaDetails: 'The area is prone to flooding',
	siteWithinGreenBelt: true,
	statutoryConsulteesDetails: 'Some other people need to be consulted',
	validation: null
};

export const appellantCaseDataNotValidatedWithDocuments = {
	...appellantCaseDataNotValidated,
	documents: {
		...appellantCaseDataNotValidated.documents,
		newSupportingDocuments: {
			folderId: 1,
			path: 'appellant_case/newSupportingDocuments',
			documents: []
		},
		appealStatement: {
			folderId: 2,
			path: 'appellant_case/appealStatement',
			documents: []
		}
	}
};

export const appellantCaseDataInvalidOutcome = {
	...appellantCaseDataNotValidated,
	validation: {
		outcome: 'Invalid',
		invalidReasons: [
			{
				name: {
					id: 1,
					name: 'Appellant name is not the same on the application form and appeal form',
					hasText: false
				},
				text: []
			},
			{
				name: {
					id: 2,
					name: 'Attachments and/or appendices have not been included to the full statement of case',
					hasText: true
				},
				text: ['test reason 1']
			},
			{
				name: {
					id: 10,
					name: 'Other',
					hasText: true
				},
				text: ['test reason 2', 'test reason 3']
			}
		]
	}
};

export const appellantCaseDataIncompleteOutcome = {
	...appellantCaseDataNotValidated,
	validation: {
		outcome: 'Incomplete',
		incompleteReasons: [
			{
				name: {
					id: 1,
					name: 'Appellant name is not the same on the application form and appeal form',
					hasText: false
				},
				text: []
			},
			{
				name: {
					id: 2,
					name: 'Attachments and/or appendices have not been included to the full statement of case',
					hasText: true
				},
				text: ['test reason 1']
			},
			{
				name: {
					id: 10,
					name: 'Other',
					hasText: true
				},
				text: ['test reason 2', 'test reason 3']
			}
		]
	}
};

export const appellantCaseDataValidOutcome = {
	...appellantCaseDataNotValidated,
	validation: {
		outcome: 'Valid'
	}
};

export const lpaQuestionnaireDataNotValidated = {
	affectsListedBuildingDetails: [
		{
			listEntry: '123456'
		}
	],
	appealId: 1,
	appealReference: 'APP/Q9999/D/21/30498',
	appealSite: {
		addressLine1: '92 Huntsmoor Road',
		town: 'Tadley',
		postCode: 'RG26 4BX'
	},
	communityInfrastructureLevyAdoptionDate: '2023-05-09T01:00:00.000Z',
	designatedSites: [
		{
			name: 'pSPA',
			description: 'potential special protection area'
		},
		{
			name: 'SAC',
			description: 'special area of conservation'
		}
	],
	developmentDescription: '',
	documents: {
		conservationMap: {
			folderId: 1,
			path: 'lpa-questionnaire/conservationMap',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56a',
					name: 'conservationAreaMap.docx',
					folderId: 1,
					caseId: 1
				}
			]
		},
		whoNotified: {
			folderId: 2,
			path: 'lpa-questionnaire/whoNotified',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56b',
					name: 'notifyingParties.docx',
					folderId: 2,
					caseId: 1
				}
			]
		},
		otherPartyRepresentations: {
			folderId: 6,
			path: 'lpa-questionnaire/otherPartyRepresentations',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56f',
					name: 'representations.docx',
					folderId: 6,
					caseId: 1
				}
			]
		},
		planningOfficerReport: {
			folderId: 7,
			path: 'lpa-questionnaire/planningOfficerReport',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56g',
					name: 'officersReport.docx',
					folderId: 7,
					caseId: 1
				}
			]
		},
		// communityInfrastructureLevy: {
		// 	folderId: 8,
		// 	path: 'lpa_questionnaire/communityInfrastructureLevy',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56h',
		// 			name: 'communityInfrastructureLevy.docx',
		// 			folderId: 8,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// consultationResponses: {
		// 	folderId: 9,
		// 	path: 'lpa_questionnaire/consultationResponses',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56i',
		// 			name: 'consultationResponses.docx',
		// 			folderId: 9,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// definitiveMapAndStatement: {
		// 	folderId: 10,
		// 	path: 'lpa_questionnaire/definitiveMapAndStatement',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56j',
		// 			name: 'definitiveMapAndStatement.docx',
		// 			folderId: 10,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// emergingPlans: {
		// 	folderId: 11,
		// 	path: 'lpa_questionnaire/emergingPlans',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56k',
		// 			name: 'emergingPlans.docx',
		// 			folderId: 11,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// environmentalStatementResponses: {
		// 	folderId: 12,
		// 	path: 'lpa_questionnaire/environmentalStatementResponses',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56l',
		// 			name: 'environmentalStatementResponses.docx',
		// 			folderId: 12,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// issuedScreeningOption: {
		// 	folderId: 13,
		// 	path: 'lpa_questionnaire/issuedScreeningOption',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56m',
		// 			name: 'issuedScreeningOption.docx',
		// 			folderId: 13,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// otherRelevantPolicies: {
		// 	folderId: 14,
		// 	path: 'lpa_questionnaire/otherRelevantPolicies',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56n',
		// 			name: 'otherRelevantPolicies.docx',
		// 			folderId: 14,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// policiesFromStatutoryDevelopment: {
		// 	folderId: 15,
		// 	path: 'lpa_questionnaire/policiesFromStatutoryDevelopment',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56o',
		// 			name: 'policiesFromStatutoryDevelopment.docx',
		// 			folderId: 15,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// relevantPartiesNotification: {
		// 	folderId: 16,
		// 	path: 'lpa_questionnaire/relevantPartiesNotification',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56p',
		// 			name: 'relevantPartiesNotification.docx',
		// 			folderId: 16,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// responsesOrAdvice: {
		// 	folderId: 17,
		// 	path: 'lpa_questionnaire/responsesOrAdvice',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56q',
		// 			name: 'responsesOrAdvice.docx',
		// 			folderId: 17,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// screeningDirection: {
		// 	folderId: 18,
		// 	path: 'lpa_questionnaire/screeningDirection',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56r',
		// 			name: 'screeningDirection.docx',
		// 			folderId: 18,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// supplementaryPlanningDocuments: {
		// 	folderId: 19,
		// 	path: 'lpa_questionnaire/supplementaryPlanningDocuments',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56s',
		// 			name: 'supplementaryPlanningDocuments.docx',
		// 			folderId: 19,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		// treePreservationOrder: {
		// 	folderId: 20,
		// 	path: 'lpa_questionnaire/treePreservationOrder',
		// 	documents: [
		// 		{
		// 			id: '9635631c-507c-4af2-98a1-da007e8bb56t',
		// 			name: 'treePreservationOrder.docx',
		// 			folderId: 20,
		// 			caseId: 1
		// 		}
		// 	]
		// },
		lpaCaseCorrespondence: {
			folderId: 21,
			path: 'lpa-questionnaire/lpaCaseCorrespondence',
			documents: [
				{
					id: '00c43c8c-829a-4aa8-883a-fd6fc1f52c3d',
					name: 'ph1.jpeg',
					folderId: 3420,
					caseId: 111,
					isLateEntry: true,
					virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED
				},
				{
					id: 'a78446aa-167a-4bef-89b7-18bcb0da11c1',
					name: 'ph0.jpeg',
					folderId: 3420,
					caseId: 111,
					isLateEntry: false,
					virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED
				},
				{
					id: 'a78446aa-167a-4bef-89b7-18bcb0da11c2',
					name: 'test-doc.jpeg',
					folderId: 3420,
					caseId: 111,
					isLateEntry: false,
					virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED
				}
			]
		}
	},
	doesAffectAListedBuilding: true,
	doesAffectAScheduledMonument: true,
	doesSiteHaveHealthAndSafetyIssues: true,
	doesSiteRequireInspectorAccess: true,
	extraConditions: 'Some extra conditions',
	hasCommunityInfrastructureLevy: true,
	hasCompletedAnEnvironmentalStatement: true,
	hasEmergingPlan: true,
	hasExtraConditions: true,
	hasOtherAppeals: null,
	hasProtectedSpecies: true,
	hasRepresentationsFromOtherParties: true,
	hasResponsesOrStandingAdviceToUpload: true,
	hasStatementOfCase: true,
	hasStatutoryConsultees: true,
	hasSupplementaryPlanningDocuments: true,
	hasTreePreservationOrder: true,
	healthAndSafetyDetails: 'There is no mobile signal at the property',
	inCAOrrelatesToCA: true,
	includesScreeningOption: true,
	inquiryDays: 2,
	inspectorAccessDetails: 'The entrance is at the back of the property',
	isAffectingNeighbouringSites: true,
	isCommunityInfrastructureLevyFormallyAdopted: true,
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
		},
		{
			listEntry: '123457'
		}
	],
	localPlanningDepartment: 'Dorset Council',
	lpaNotificationMethods: [
		{
			name: 'A site notice'
		},
		{
			name: 'Letter/email to interested parties'
		}
	],
	lpaQuestionnaireId: 2,
	meetsOrExceedsThresholdOrCriteriaInColumn2: true,
	otherAppeals: [
		{
			appealId: 2,
			appealReference: 'APP/Q9999/D/21/725284'
		}
	],
	procedureType: 'Written',
	scheduleType: 'Schedule 2',
	sensitiveAreaDetails: 'The area is prone to flooding',
	siteWithinGreenBelt: true,
	statutoryConsulteesDetails: 'Some other people need to be consulted',
	validation: null
};

export const lpaQuestionnaireDataNotValidatedWithDocuments = {
	...lpaQuestionnaireDataNotValidated,
	documents: {
		...lpaQuestionnaireDataNotValidated.documents,
		conservationAreaMap: {
			folderId: 1,
			path: 'lpa_questionnaire/conservationAreaMap',
			documents: [
				{
					id: '9635631c-507c-4af2-98a1-da007e8bb56b',
					name: 'conservationAreaMap.docx',
					folderId: 1,
					caseId: 1
				}
			]
		}
	}
};

export const lpaQuestionnaireDataIncompleteOutcome = {
	...lpaQuestionnaireDataNotValidated,
	validation: {
		outcome: 'Incomplete',
		incompleteReasons: [
			{
				name: {
					id: 1,
					name: 'Policies are missing',
					hasText: true
				},
				text: ['test reason 1']
			},
			{
				name: {
					id: 2,
					name: 'Other documents or information are missing',
					hasText: true
				},
				text: ['test reason 2', 'test reason 3']
			},
			{
				name: {
					id: 3,
					name: 'Other',
					hasText: true
				},
				text: ['test reason 4', 'test reason 5', 'test reason 6']
			}
		]
	}
};

export const lpaQuestionnaireDataCompleteOutcome = {
	...lpaQuestionnaireDataNotValidated,
	validation: {
		outcome: 'Complete'
	}
};

export const getRandomLocalPlanningDepartment = () =>
	/** @type {string} */ (sample(localPlanningDepartments));

export const appellantCaseInvalidReasons = [
	{
		id: 21,
		name: 'Appeal has not been submitted on time',
		hasText: false
	},
	{
		id: 22,
		name: 'Documents have not been submitted on time',
		hasText: true
	},
	{
		id: 23,
		name: "The appellant doesn't have the right to appeal",
		hasText: false
	},
	{
		id: 24,
		name: 'Other',
		hasText: true
	}
];

export const appellantCaseIncompleteReasons = [
	{
		id: 2025,
		name: 'Appellant name is not the same on the application form and appeal form',
		hasText: false
	},
	{
		id: 2026,
		name: 'Attachments and/or appendices have not been included to the full statement of case',
		hasText: true
	},
	{
		id: 2027,
		name: "LPA's decision notice is incorrect or incomplete",
		hasText: true
	},
	{
		id: 2028,
		name: 'Documents and plans referred in the application form, decision notice and appeal covering letter are missing',
		hasText: true
	},
	{
		id: 2029,
		name: 'Site ownership certificate, agricultural holding certificate and declaration have not been completed on the appeal form',
		hasText: false
	},
	{
		id: 2030,
		name: 'The original application form is incomplete or missing',
		hasText: false
	},
	{
		id: 2031,
		name: 'Statement of case and ground of appeal are missing',
		hasText: false
	},
	{
		id: 2032,
		name: 'Other',
		hasText: true
	}
];

export const lpaQuestionnaireIncompleteReasons = [
	{
		id: 1,
		name: 'Documents or information are missing',
		hasText: true
	},
	{
		id: 2,
		name: 'Policies are missing',
		hasText: true
	},
	{
		id: 3,
		name: 'Other',
		hasText: true
	},
	{
		id: 4,
		name: 'Test incomplete reason without text 1',
		hasText: false
	},
	{
		id: 5,
		name: 'Test incomplete reason without text 2',
		hasText: false
	}
];

export const siteVisitData = {
	appealId: 1,
	visitDate: '2023-10-09T01:00:00.000Z',
	siteVisitId: 0,
	visitEndTime: '10:44',
	visitStartTime: '09:38',
	visitType: 'Accompanied',
	previousVisitType: 'Unaccompanied',
	siteVisitChangeType: 'date-time'
};

export const appealTypesData = [
	{
		id: 75,
		type: 'Planning appeal',
		shorthand: 'FPA',
		key: 'A',
		enabled: false
	},
	{
		id: 76,
		type: 'Enforcement notice appeal',
		shorthand: 'X1',
		key: 'C',
		enabled: false
	}
];

export const inspectorDecisionData = {
	outcome: 'dismissed',
	documentId: 'e1e90a49-fab3-44b8-a21a-bb73af089f6b',
	letterDate: '2023-12-25T00:00:00.000Z'
};

export const activeDirectoryUsersData = [
	{
		'@odata.type': '#microsoft.graph.user',
		id: '923ac03b-9031-4cf4-8b17-348c274321f9',
		name: 'Smith, John',
		email: 'John.Smith@planninginspectorate.gov.uk'
	},
	{
		'@odata.type': '#microsoft.graph.user',
		id: '2',
		name: 'Doe, Jane',
		email: 'Jane.Doe@planninginspectorate.gov.uk'
	},
	{
		'@odata.type': '#microsoft.graph.user',
		id: '3',
		name: 'Bloggs, Joe',
		email: 'Joe.Bloggs@planninginspectorate.gov.uk'
	},
	{
		'@odata.type': '#microsoft.graph.user',
		id: '4',
		name: 'Jenkins, Leeroy',
		email: 'Leeroy.Jenkins@planninginspectorate.gov.uk'
	}
];

export const allocationDetailsData = {
	levels: [
		{
			level: 'A',
			band: 3
		},
		{
			level: 'B',
			band: 3
		}
	],
	specialisms: [
		{
			id: 1,
			name: 'Specialism 1'
		},
		{
			id: 2,
			name: 'Specialism 2'
		},
		{
			id: 3,
			name: 'Specialism 3'
		}
	]
};

export const documentFileInfo = {
	guid: 'd51f408c-7c6f-4f49-bcc0-abbb5bea3be6',
	name: 'ph0-documentFileInfo.jpeg',
	folderId: 1269,
	createdAt: '2023-10-11T13:57:41.592Z',
	isDeleted: false,
	caseId: '1',
	latestDocumentVersion: {
		documentId: 'd51f408c-7c6f-4f49-bcc0-abbb5bea3be6',
		version: 1,
		documentType: 'conservationAreaMap',
		originalFilename: 'ph0-documentFileInfo.jpeg',
		fileName: 'ph0-documentFileInfo.jpeg',
		mime: 'image/jpeg',
		horizonDataID: null,
		fileMD5: null,
		path: null,
		virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED,
		size: 58861,
		stage: 'lpa_questionnaire',
		blobStorageContainer: 'document-service-uploads',
		blobStoragePath:
			'appeal/APP-Q9999-D-21-655112/d51f408c-7c6f-4f49-bcc0-abbb5bea3be6/v1/ph0.jpeg',
		dateCreated: '2023-10-11T13:57:41.592Z',
		datePublished: null,
		isDeleted: false,
		isLateEntry: false,
		redactedStatus: null,
		documentURI:
			'https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploads/appeal/APP-Q9999-D-21-655112/d51f408c-7c6f-4f49-bcc0-abbb5bea3be6/v1/ph0.jpeg',
		dateReceived: '2023-10-11T13:57:41.592Z'
	}
};

export const documentFileInfoLateEntry = {
	...documentFileInfo,
	folderId: 2865,
	latestDocumentVersion: {
		isLateEntry: true
	}
};

export const documentFolderInfo = {
	caseId: 103,
	documents: [
		{
			id: '15d19184-155b-4b6c-bba6-2bd2a61ca9a3',
			name: 'test-pdf-documentFolderInfo.pdf',
			latestDocumentVersion: {
				draft: false,
				dateReceived: '2023-02-01T01:00:00.000Z',
				redactionStatus: 'Redacted',
				size: 129363,
				mime: 'application/pdf',
				isLateEntry: false
			}
		},
		{
			id: '47d8f073-c837-4f07-9161-c1a5626eba56',
			name: 'sample-20s-documentFolderInfo.mp4',
			latestDocumentVersion: {
				draft: false,
				dateReceived: '2024-03-02T01:00:00.000Z',
				redactionStatus: 'Unredacted',
				size: 11815175,
				mime: 'video/mp4',
				virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED,
				isLateEntry: true
			}
		},
		{
			id: '97260151-4334-407f-a76a-0b5666cbcfa6',
			name: 'ph0-documentFolderInfo.jpeg',
			latestDocumentVersion: {
				draft: false,
				dateReceived: '2025-04-03T01:00:00.000Z',
				redactionStatus: 'No redaction required',
				size: 58861,
				mime: 'image/jpeg',
				virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.AFFECTED,
				isLateEntry: false
			}
		},
		{
			id: '97260151-4334-407f-a76a-0b5666cbcfa7',
			name: 'ph1-documentFolderInfo.jpeg',
			latestDocumentVersion: {
				draft: false,
				dateReceived: '2025-04-03T01:00:00.000Z',
				redactionStatus: 'Unredacted',
				size: 58987,
				mime: 'image/jpeg',
				virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED,
				isLateEntry: true
			}
		}
	],
	folderId: 2864,
	path: 'appellant-case/changedDescription'
};

export const documentFolderInfoWithoutDraftDocuments = {
	caseId: 103,
	documents: [
		{
			id: '15d19184-155b-4b6c-bba6-2bd2a61ca9a3',
			name: 'test-pdf-documentFolderInfo.pdf',
			latestDocumentVersion: {
				draft: false,
				dateReceived: '2023-02-01T01:00:00.000Z',
				redactionStatus: 'Redacted',
				size: 129363,
				mime: 'application/pdf',
				isLateEntry: false
			}
		},
		{
			id: '47d8f073-c837-4f07-9161-c1a5626eba56',
			name: 'sample-20s-documentFolderInfo.mp4',
			latestDocumentVersion: {
				draft: false,
				dateReceived: '2024-03-02T01:00:00.000Z',
				redactionStatus: 'Unredacted',
				size: 11815175,
				mime: 'video/mp4',
				virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED,
				isLateEntry: true
			}
		}
	],
	folderId: 2864,
	path: 'appellant-case/changedDescription'
};

export const additionalDocumentsFolderInfo = {
	...documentFolderInfo,
	folderId: 2865,
	path: 'appellant-case/appellantCaseCorrespondence'
};

export const notCheckedDocumentFolderInfoDocuments = {
	id: '9635631c-507c-4af2-98a1-da007e8bb56a',
	name: 'applicationForm.docx',
	folderId: 1,
	caseId: 1,
	latestDocumentVersion: {
		draft: false,
		dateReceived: '2024-03-02T01:00:00.000Z',
		redactionStatus: 'Unredacted',
		size: 11815175,
		mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED,
		isLateEntry: true
	}
};

export const scanFailedDocumentFolderInfoDocuments = {
	id: '9635631c-507c-4af2-98a1-da007e8bb56a',
	name: 'applicationForm.docx',
	folderId: 1,
	caseId: 1,
	latestDocumentVersion: {
		draft: false,
		dateReceived: '2024-03-02T01:00:00.000Z',
		redactionStatus: 'Unredacted',
		size: 11815175,
		mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.AFFECTED,
		isLateEntry: true
	}
};

export const documentRedactionStatuses = [
	{
		id: 1,
		key: APPEAL_REDACTED_STATUS.REDACTED,
		name: 'Redacted'
	},
	{
		id: 2,
		key: APPEAL_REDACTED_STATUS.NOT_REDACTED,
		name: 'Unredacted'
	},
	{
		id: 3,
		key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED,
		name: 'No redaction required'
	}
];

export const documentFileVersionsInfo = {
	id: '15d19184-155b-4b6c-bba6-2bd2a61ca9a3',
	name: 'test-pdf-documentFileVersionsInfo.pdf',
	folderId: 2864,
	createdAt: '2023-10-31T13:14:14.474Z',
	caseId: 103,
	latestDocumentVersion: {
		documentId: '15d19184-155b-4b6c-bba6-2bd2a61ca9a3',
		version: 1,
		documentType: 'newSupportingDocuments',
		originalFilename: 'test-pdf-documentFileVersionsInfo.pdf',
		fileName: 'test-pdf-documentFileVersionsInfo.pdf',
		mime: 'application/pdf',
		horizonDataID: null,
		fileMD5: null,
		path: null,
		virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED,
		size: 129363,
		stage: 'appellant_case',
		blobStorageContainer: 'document-service-uploads',
		blobStoragePath:
			'appeal/APP-Q9999-D-21-254218/15d19184-155b-4b6c-bba6-2bd2a61ca9a3/v1/test-pdf.pdf',
		dateCreated: '2023-10-31T13:14:14.474Z',
		isDeleted: false,
		isLateEntry: false,
		redactionStatus: 'Redacted',
		documentURI:
			'https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploads/appeal/APP-Q9999-D-21-254218/15d19184-155b-4b6c-bba6-2bd2a61ca9a3/v1/test-pdf.pdf',
		dateReceived: '2023-02-01T01:00:00.000Z'
	},
	allVersions: [
		{
			documentId: '15d19184-155b-4b6c-bba6-2bd2a61ca9a3',
			version: 1,
			documentType: 'newSupportingDocuments',
			originalFilename: 'test-pdf-documentFileVersionsInfo.pdf',
			fileName: 'test-pdf-documentFileVersionsInfo.pdf',
			mime: 'application/pdf',
			horizonDataID: null,
			fileMD5: null,
			path: null,
			virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED,
			size: 129363,
			stage: 'appellant_case',
			blobStorageContainer: 'document-service-uploads',
			blobStoragePath:
				'appeal/APP-Q9999-D-21-254218/15d19184-155b-4b6c-bba6-2bd2a61ca9a3/v1/test-pdf.pdf',
			dateCreated: '2023-10-31T13:14:14.474Z',
			isDeleted: false,
			isLateEntry: false,
			redactionStatus: 'Redacted',
			documentURI:
				'https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploads/appeal/APP-Q9999-D-21-254218/15d19184-155b-4b6c-bba6-2bd2a61ca9a3/v1/test-pdf.pdf',
			dateReceived: '2023-02-01T01:00:00.000Z'
		}
	],
	versionAudit: [
		{
			id: 2008,
			documentGuid: '15d19184-155b-4b6c-bba6-2bd2a61ca9a3',
			version: 1,
			auditTrailId: 2008,
			action: 'Create',
			auditTrail: {
				id: 2008,
				appealId: 103,
				userId: 1007,
				loggedAt: '2023-10-31T13:14:14.534Z',
				details: 'The document test-pdf.pdf was uploaded (v1)',
				user: {
					id: 1007,
					azureAdUserId: '923ac03b-9031-4cf4-8b17-348c274321f9',
					sapId: null
				}
			}
		}
	]
};

export const documentFileVersionsInfoNotChecked = {
	...documentFileVersionsInfo,
	latestDocumentVersion: {
		...documentFileVersionsInfo.allVersions[0],
		virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED
	},
	allVersions: [
		{
			...documentFileVersionsInfo.allVersions[0],
			virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED
		}
	]
};

export const documentFileVersionsInfoVirusFound = {
	...documentFileVersionsInfo,
	latestDocumentVersion: {
		...documentFileVersionsInfo.allVersions[0],
		virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.AFFECTED
	},
	allVersions: [
		{
			...documentFileVersionsInfo.allVersions[0],
			virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.AFFECTED
		}
	]
};

export const documentFileVersionsInfoChecked = {
	...documentFileVersionsInfo,
	latestDocumentVersion: {
		...documentFileVersionsInfo.allVersions[0],
		virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED
	},
	allVersions: [
		{
			...documentFileVersionsInfo.allVersions[0],
			virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED
		}
	]
};

export const documentFileMultipleVersionsInfoWithLatestAsLateEntry = {
	...documentFileVersionsInfo,
	latestVersionId: 2,
	allVersions: [
		{
			...documentFileVersionsInfo.allVersions[0],
			version: 2,
			isLateEntry: true
		},
		{
			...documentFileVersionsInfo.allVersions[0],
			version: 1,
			isLateEntry: false
		}
	]
};

export const assignedAppealsPage1 = {
	itemCount: 9,
	items: [
		{
			appealId: 189,
			appealReference: 'TEST/458673',
			appealSite: {
				addressLine1: '72 Clapham High St',
				county: 'Wandsworth',
				postCode: 'SW4 7UL'
			},
			appealStatus: 'lpa_questionnaire',
			appealType: 'Householder',
			createdAt: '2024-01-02T11:43:21.830Z',
			localPlanningDepartment: 'Maidstone Borough Council',
			lpaQuestionnaireId: 82,
			appealTimetable: {
				appealTimetableId: 83,
				lpaQuestionnaireDueDate: '2022-04-08T09:00:00.000Z'
			},
			dueDate: '2022-04-08T09:00:00.000Z',
			isParentAppeal: true,
			isChildAppeal: false
		},
		{
			appealId: 161,
			appealReference: 'TEST/685020',
			appealSite: {
				addressLine1: '44 Rivervale',
				town: 'Bridport',
				postCode: 'DT6 5RN'
			},
			appealStatus: 'ready_to_start',
			appealType: 'Householder',
			createdAt: '2024-01-02T11:43:21.081Z',
			localPlanningDepartment: 'Wiltshire Council',
			lpaQuestionnaireId: null,
			dueDate: '2024-01-07T11:43:21.081Z',
			isParentAppeal: false,
			isChildAppeal: true
		},
		{
			appealId: 162,
			appealReference: 'TEST/424942',
			appealSite: {
				addressLine1: '44 Rivervale',
				town: 'Bridport',
				postCode: 'DT6 5RN'
			},
			appealStatus: 'ready_to_start',
			appealType: 'Householder',
			createdAt: '2024-01-02T11:43:21.142Z',
			localPlanningDepartment: 'Dorset Council',
			lpaQuestionnaireId: null,
			dueDate: '2024-01-07T11:43:21.142Z',
			isParentAppeal: false,
			isChildAppeal: false
		},
		{
			appealId: 163,
			appealReference: 'TEST/769207',
			appealSite: {
				addressLine1: 'Copthalls',
				addressLine2: 'Clevedon Road',
				town: 'West Hill',
				postCode: 'BS48 1PN'
			},
			appealStatus: 'ready_to_start',
			appealType: 'Householder',
			createdAt: '2024-01-02T11:43:21.169Z',
			localPlanningDepartment: 'Wiltshire Council',
			lpaQuestionnaireId: null,
			dueDate: '2024-01-07T11:43:21.169Z',
			isParentAppeal: false,
			isChildAppeal: false
		},
		{
			appealId: 164,
			appealReference: 'TEST/83896',
			appealSite: {
				addressLine1: '92 Huntsmoor Road',
				town: 'Tadley',
				postCode: 'RG26 4BX'
			},
			appealStatus: 'ready_to_start',
			appealType: 'Householder',
			createdAt: '2024-01-02T11:43:21.199Z',
			localPlanningDepartment: 'Dorset Council',
			lpaQuestionnaireId: null,
			dueDate: '2024-01-07T11:43:21.199Z',
			isParentAppeal: false,
			isChildAppeal: false
		}
	],
	statuses: ['ready_to_start', 'lpa_questionnaire', 'issue_determination'],
	page: 1,
	pageCount: 2,
	pageSize: 5
};

export const assignedAppealsPage2 = {
	itemCount: 9,
	items: [
		{
			appealId: 165,
			appealReference: 'TEST/333600',
			appealSite: {
				addressLine1: '21 The Pavement',
				county: 'Wandsworth',
				postCode: 'SW4 0HY'
			},
			appealStatus: 'ready_to_start',
			appealType: 'Householder',
			createdAt: '2024-01-02T11:43:21.226Z',
			localPlanningDepartment: 'Bristol City Council',
			lpaQuestionnaireId: null,
			dueDate: '2024-01-07T11:43:21.226Z'
		},
		{
			appealId: 166,
			appealReference: 'TEST/216911',
			appealSite: {
				addressLine1: 'FOR TRAINERS ONLY',
				addressLine2: '92 Huntsmoor Road',
				town: 'Tadley',
				postCode: 'RG26 4BX'
			},
			appealStatus: 'ready_to_start',
			appealType: 'Householder',
			createdAt: '2024-01-02T11:43:21.255Z',
			localPlanningDepartment: 'Waveney District Council',
			lpaQuestionnaireId: null,
			dueDate: '2024-01-07T11:43:21.255Z'
		},
		{
			appealId: 167,
			appealReference: 'TEST/600715',
			appealSite: {
				addressLine1: 'FOR TRAINERS ONLY',
				addressLine2: '55 Butcher Street',
				town: 'Thurnscoe',
				postCode: 'S63 0RB'
			},
			appealStatus: 'ready_to_start',
			appealType: 'Householder',
			createdAt: '2024-01-02T11:43:21.279Z',
			localPlanningDepartment: 'Dorset Council',
			lpaQuestionnaireId: null,
			dueDate: '2024-01-07T11:43:21.279Z'
		},
		{
			appealId: 168,
			appealReference: 'TEST/700910',
			appealSite: {
				addressLine1: 'FOR TRAINERS ONLY',
				addressLine2: '21 The Pavement',
				county: 'Wandsworth',
				postCode: 'SW4 0HY'
			},
			appealStatus: 'issue_determination',
			appealType: 'Householder',
			createdAt: '2024-01-02T11:43:21.298Z',
			localPlanningDepartment: 'Wiltshire Council',
			lpaQuestionnaireId: null,
			dueDate: '2024-01-07T11:43:21.298Z'
		}
	],
	statuses: ['ready_to_start', 'lpa_questionnaire', 'issue_determination'],
	page: 2,
	pageCount: 2,
	pageSize: 5
};

export const assignedAppealsPage3 = {
	itemCount: 9,
	items: [
		{
			appealId: 165,
			appealReference: 'TEST/333600',
			appealSite: {
				addressLine1: '21 The Pavement',
				county: 'Wandsworth',
				postCode: 'SW4 0HY'
			},
			appealStatus: 'ready_to_start',
			appealType: 'Householder',
			createdAt: '2024-01-02T11:43:21.226Z',
			localPlanningDepartment: 'Bristol City Council',
			lpaQuestionnaireId: null,
			dueDate: '2024-01-07T11:43:21.226Z'
		}
	],
	statuses: ['ready_to_start', 'lpa_questionnaire', 'issue_determination'],
	page: 2,
	pageCount: 2,
	pageSize: 1
};

export const linkedAppeals = [
	{
		appealId: 5449,
		appealReference: 'TEST-784706',
		appealType: 'Householder',
		externalSource: false,
		isParentAppeal: false,
		linkingDate: '2024-02-21T10:15:10.436Z',
		relationshipId: 3046
	},
	{
		appealId: null,
		appealReference: '87326527',
		appealType: 'Unknown',
		externalSource: true,
		isParentAppeal: false,
		linkingDate: '2024-01-24T11:16:11.436Z',
		relationshipId: 3049
	},
	{
		appealId: 5464,
		appealReference: 'TEST-140079',
		appealType: 'Householder',
		externalSource: false,
		isParentAppeal: true,
		linkingDate: '2024-02-21T10:15:10.436Z',
		relationshipId: 3048
	},
	{
		appealId: 5451,
		appealReference: 'TEST-721086',
		appealType: 'Householder',
		externalSource: false,
		isParentAppeal: false,
		linkingDate: '2024-02-21T11:10:15.491Z',
		relationshipId: 3057
	}
];

export const linkedAppealsWithExternalLead = [
	...linkedAppeals,
	{
		appealId: null,
		appealReference: '76215416',
		appealType: 'Unknown',
		externalSource: true,
		isParentAppeal: true,
		linkingDate: '2024-02-21T10:15:10.436Z',
		relationshipId: 3049
	}
];

export const linkableAppealSummaryBackOffice = {
	appealId: '5448',
	appealReference: 'TEST-12345',
	appealType: 'Householder',
	appealStatus: 'assign_case_officer',
	siteAddress: {
		addressLine1: '96 The Avenue',
		addressLine2: 'Maidstone',
		town: '',
		county: 'Kent',
		postCode: 'MD21 5XY'
	},
	localPlanningDepartment: 'Wiltshire Council',
	appellantName: 'Roger Simmons',
	agentName: 'Eva Sharma (Eva Sharma Ltd)',
	submissionDate: '2024-02-21T10:15:09.378Z',
	source: 'back-office'
};

export const linkableAppealSummaryHorizon = {
	appealId: '20486402',
	appealReference: '3171066',
	appealType: 'Planning Appeal (W)',
	appealStatus: 'Closed - Opened in Error',
	siteAddress: {
		addressLine1: 'Planning Inspectorate',
		addressLine2: 'Temple Quay House, 2 The Square, Temple Quay',
		town: 'BRISTOL',
		postCode: 'BS1 6PN'
	},
	localPlanningDepartment: 'System Test Borough Council',
	appellantName: 'Mrs Tammy Rogers',
	agentName: null,
	submissionDate: '2017-03-07T00:00:00.000Z',
	source: 'horizon'
};

export const linkedAppealBackOffice = {
	appealId: 5464,
	appealReference: 'TEST-140079',
	isParentAppeal: false,
	linkingDate: '2024-02-21T10:15:10.436Z',
	appealType: 'Householder',
	relationshipId: 3048,
	externalSource: false
};

export const linkedAppealHorizon = {
	appealId: null,
	appealReference: '76215416',
	isParentAppeal: false,
	linkingDate: '2024-02-21T10:15:10.436Z',
	appealType: 'Unknown',
	relationshipId: 3049,
	externalSource: true
};

export const linkableAppeal = {
	appealId: 3,
	appealReference: '12345',
	appealType: 'Planning Appeal (W)',
	appealStatus: 'Decision Issued',
	siteAddress: {
		siteAddressLine1: '123 Main Street',
		siteAddressLine2: 'Brentry',
		siteAddressTown: 'Bristol',
		siteAddressCounty: 'Bristol, city of',
		siteAddressPostcode: 'BS1 1AA'
	},
	localPlanningDepartment: 'Bristol City Council',
	appellantName: 'Mr John Wick',
	agentName: 'Mr John Smith (Smith Planning Agency)',
	submissionDate: '2014-11-14T00:00:00+00:00',
	source: 'back-office'
};

export const costsFolderInfoAppellantApplication = {
	caseId: 1,
	documents: [
		{
			id: '15d19184-155b-4b6c-bba6-2bd2a61ca9a3',
			name: 'test-pdf-documentFolderInfo.pdf',
			latestDocumentVersion: {
				draft: false,
				dateReceived: '2023-02-01T01:00:00.000Z',
				redactionStatus: 'Redacted',
				size: 129363,
				mime: 'application/pdf',
				virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED,
				isLateEntry: false
			}
		},
		{
			id: '47d8f073-c837-4f07-9161-c1a5626eba56',
			name: 'sample-20s-documentFolderInfo.mp4',
			latestDocumentVersion: {
				draft: false,
				dateReceived: '2024-03-02T01:00:00.000Z',
				redactionStatus: 'No redaction required',
				size: 11815175,
				mime: 'video/mp4',
				virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED,
				isLateEntry: false
			}
		}
	],
	folderId: 1,
	path: 'costs/appellantCostsApplication'
};

export const costsFolderInfoAppellantWithdrawal = {
	...costsFolderInfoAppellantApplication,
	folderId: 2,
	path: 'costs/appellantCostsWithdrawal'
};

export const costsFolderInfoAppellantCorrespondence = {
	...costsFolderInfoAppellantApplication,
	folderId: 3,
	path: 'costs/appellantCostsCorrespondence'
};

export const costsFolderInfoLpaApplication = {
	...costsFolderInfoAppellantApplication,
	folderId: 4,
	path: 'costs/lpaCostsApplication'
};

export const costsFolderInfoLpaWithdrawal = {
	...costsFolderInfoAppellantApplication,
	folderId: 5,
	path: 'costs/lpaCostsWithdrawal'
};

export const costsFolderInfoLpaCorrespondence = {
	...costsFolderInfoAppellantApplication,
	folderId: 6,
	path: 'costs/lpaCostsCorrespondence'
};

export const costsFolderInfoDecision = {
	...costsFolderInfoAppellantApplication,
	folderId: 7,
	path: 'costs/costsDecisionLetter'
};

export const folderInfoCrossTeamCorrespondence = {
	...costsFolderInfoAppellantApplication,
	folderId: 10,
	path: 'internal/crossTeamCorrespondence'
};

export const folderInfoInspectorCorrespondence = {
	...costsFolderInfoAppellantApplication,
	folderId: 11,
	path: 'internal/inspectorCorrespondence'
};

export const appealCostsDocumentItem = {
	guid: 'd2197025-5edb-4477-8e98-2a1bf13ed2ea',
	name: '_821df3b2-08ea-4f56-b8e7-97c3502cd73a_test-doc-alternate.docx',
	folderId: 1,
	createdAt: '2024-04-09T13:10:07.517Z',
	isDeleted: false,
	latestVersionId: 1,
	caseId: 1,
	latestDocumentVersion: {
		documentGuid: 'd2197025-5edb-4477-8e98-2a1bf13ed2ea',
		version: 1,
		lastModified: null,
		documentType: 'appellant',
		published: false,
		draft: false,
		sourceSystem: 'back-office-appeals',
		origin: null,
		originalFilename: 'test-doc-alternate.docx',
		fileName: 'test-doc-alternate.docx',
		representative: null,
		description: null,
		owner: null,
		author: null,
		securityClassification: null,
		mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		horizonDataID: null,
		fileMD5: null,
		path: null,
		virusCheckStatus: APPEAL_VIRUS_CHECK_STATUS.SCANNED,
		size: 656030,
		stage: 'appeal_costs',
		blobStorageContainer: 'document-service-uploads',
		blobStoragePath:
			'appeal/6014692/d2197025-5edb-4477-8e98-2a1bf13ed2ea/v1/test-doc-alternate.docx',
		dateCreated: '2024-04-09T13:10:07.517Z',
		datePublished: null,
		dateReceived: '2024-04-09T13:10:07.562Z',
		isDeleted: false,
		isLateEntry: false,
		redactionStatusId: 2,
		redacted: false,
		documentURI:
			'https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploads/appeal/6014692/d2197025-5edb-4477-8e98-2a1bf13ed2ea/v1/test-doc-alternate.docx'
	}
};

export const fileUploadInfo =
	'[{"name": "test-document.txt", "GUID": "1", "fileRowId": "1", "blobStoreUrl": "/", "mimeType": "txt", "documentType": "txt", "size": 1, "stage": "appellant-case"}]';

export const withdrawalRequestData = {
	withdrawal: {
		withdrawalFolder: {
			caseId: '38',
			documents: [
				{
					caseId: 38,
					folderId: 671,
					id: '614dbbaa-da49-40df-8e39-e6f299225425',
					name: 'withdrawal-request-document.pdf',
					isDeleted: false,
					createdAt: '2024-07-03T11:22:31.639Z',
					versionAudit: [],
					latestDocumentVersion: {
						documentId: '614dbbaa-da49-40df-8e39-e6f299225425',
						version: 1,
						fileName: 'withdrawal-request-document.pdf',
						originalFilename: 'withdrawal-request-document.pdf',
						dateReceived: '2024-07-03T00:00:00.000Z',
						redactionStatus: 'No redaction required',
						virusCheckStatus: 'scanned',
						size: '3028',
						mime: 'application/pdf',
						isLateEntry: false,
						isDeleted: false,
						documentType: 'appellantCaseWithdrawalLetter',
						stage: 'appellant-case',
						blobStorageContainer: 'document-service-uploads',
						blobStoragePath:
							'appeal/6000038/614dbbaa-da49-40df-8e39-e6f299225425/v1/a-sample-1.pdf',
						documentURI:
							'https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/appeal/6000038/614dbbaa-da49-40df-8e39-e6f299225425/v1/a-sample-1.pdf'
					}
				}
			],
			folderId: 671,
			path: 'appellant-case/appellantCaseWithdrawalLetter'
		},
		withdrawalRequestDate: '2024-07-08T10:27:06.626Z'
	}
};

export const lpaNotificationMethodsData = [
	{
		id: 9029,
		key: 'notice',
		name: 'A site notice'
	},
	{
		id: 9030,
		key: 'letter',
		name: 'Letter/email to interested parties'
	},
	{
		id: 9031,
		key: 'press-advert',
		name: 'A press advert'
	}
];

export const baseSession = {
	id: '',
	cookie: { originalMaxAge: 1 },
	regenerate: function () {
		throw new Error('Function not implemented.');
	},
	destroy: function () {
		throw new Error('Function not implemented.');
	},
	reload: function () {
		throw new Error('Function not implemented.');
	},
	resetMaxAge: function () {
		throw new Error('Function not implemented.');
	},
	save: function () {
		throw new Error('Function not implemented.');
	},
	touch: function () {
		throw new Error('Function not implemented.');
	}
};
