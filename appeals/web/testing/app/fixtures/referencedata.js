import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import {
	DOCUMENT_STATUS_NOT_RECEIVED,
	DOCUMENT_STATUS_RECEIVED,
	VALIDATION_OUTCOME_INCOMPLETE
	// @ts-ignore
} from '@pins/appeals/constants/support.js';
import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE,
	APPEAL_REDACTED_STATUS,
	APPEAL_TYPE_OF_PLANNING_APPLICATION,
	APPEAL_VIRUS_CHECK_STATUS
} from '@planning-inspectorate/data-model';
import { sample } from 'lodash-es';

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
		redactionStatus: 'No redaction required',
		documentURI:
			'https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploads/appeal/APP-Q9999-D-21-655112/d51f408c-7c6f-4f49-bcc0-abbb5bea3be6/v1/ph0.jpeg',
		dateReceived: '2023-10-11T13:57:41.592Z'
	}
};

export const documentFileVersionInfo = {
	guid: 'd51f408c-7c6f-4f49-bcc0-abbb5bea3be6',
	name: 'ph0-documentFileInfo.jpeg',
	folderId: 1269,
	createdAt: '2023-10-11T13:57:41.592Z',
	isDeleted: false,
	caseId: '1',
	allVersions: [
		{ dateReceived: '2023-08-04T13:57:41.592Z' },
		{ dateReceived: '2023-08-11T13:57:41.592Z' }
	],
	latestDocumentVersion: {
		documentId: 'd51f408c-7c6f-4f49-bcc0-abbb5bea3be6',
		version: 2,
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
		redactionStatus: 'No redaction required',
		documentURI:
			'https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploads/appeal/APP-Q9999-D-21-655112/d51f408c-7c6f-4f49-bcc0-abbb5bea3be6/v1/ph0.jpeg',
		dateReceived: '2023-10-11T13:57:41.592Z'
	}
};

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
	},
	{
		'@odata.type': '#microsoft.graph.user',
		id: 'abac693e-4332-4a02-bb21-af05b9fee854',
		name: 'McTest, George',
		email: 'George.McTest@planninginspectorate.gov.uk'
	}
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
	statusesInNationalList: [
		'assign_case_officer',
		'lpa_questionnaire',
		'statements',
		'evidence',
		'ready_to_start',
		'validation',
		'final_comments',
		'invalid',
		'issue_determination',
		'withdrawn'
	],
	lpas: [{ lpaCode: '1', name: 'Test LPA' }],
	inspectors: [{ azureAdUserId: activeDirectoryUsersData[0].id, id: 0 }],
	caseOfficers: [{ azureAdUserId: activeDirectoryUsersData[1].id, id: 1 }],
	padsInspectors: [],
	assignedTeamId: 1,
	assignedTeam: {
		id: 1,
		name: 'test',
		email: 'test@email.com'
	},
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
	stateList: [],
	completedStateList: [],
	appealTimetable: {
		appealTimetableId: 1053,
		lpaQuestionnaireDueDate: '2023-10-11T01:00:00.000Z',
		finalCommentsDueDate: '2023-10-12T01:00:00.000Z'
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
		},
		appellantDecisionFolder: {
			caseId: '1',
			folderId: 8,
			path: 'costs/appellantCostsDecision',
			documents: []
		},
		lpaDecisionFolder: {
			caseId: '1',
			folderId: 9,
			path: 'costs/lpaCostsDecision',
			documents: []
		}
	},
	decision: {
		folderId: 123,
		outcome: 'dismissed',
		documentId: 'e1e90a49-fab3-44b8-a21a-bb73af089f6b',
		documentName: 'decision-letter.pdf',
		letterDate: '2023-12-25T00:00:00.000Z'
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
		},
		mainParty: {
			caseId: '1',
			folderId: 22,
			path: 'internal/mainParty',
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
	padsInspector: null,
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
	lpaEmailAddress: 'wilt@lpa-email.gov.uk',
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
		visitEndTime: '2023-10-09T09:00:00.000Z',
		visitStartTime: '2023-10-09T08:38:00.000Z',
		visitType: 'Accompanied'
	},
	hearing: {
		hearingId: 0,
		hearingEndTime: undefined,
		hearingStartTime: '2023-10-09T08:38:00.000Z',
		addressId: 99,
		address: {
			addressId: 1,
			addressLine1: '96 The Avenue',
			addressLine2: 'Maidstone',
			county: 'Kent',
			postCode: 'MD21 5XY'
		}
	},
	inquiry: {
		inquiryId: 0,
		inquiryEndTime: undefined,
		inquiryStartTime: '2023-10-09T08:38:00.000Z',
		addressId: 99,
		address: {
			addressId: 1,
			addressLine1: '96 The Avenue',
			addressLine2: 'Maidstone',
			county: 'Kent',
			postCode: 'MD21 5XY'
		}
	},
	createdAt: '2023-05-21T10:27:06.626Z',
	startedAt: '2023-05-23T10:27:06.626Z',
	validAt: '2023-05-23T10:27:06.626Z',
	documentationSummary: {
		appellantCase: {
			status: 'received',
			dueDate: '2024-10-02T10:27:06.626Z',
			receivedAt: '2024-08-02T10:27:06.626Z',
			representationStatus: 'awaiting_review'
		},
		lpaQuestionnaire: {
			status: 'not_received',
			dueDate: '2024-10-11T10:27:06.626Z',
			receivedAt: '2024-08-02T10:27:06.626Z',
			representationStatus: 'awaiting_review'
		},
		appellantProofOfEvidence: {
			status: 'not_received',
			dueDate: '2024-10-12T10:27:06.626Z',
			receivedAt: '2024-08-02T10:27:06.626Z',
			representationStatus: 'awaiting_review'
		},
		lpaProofOfEvidence: {
			status: 'not_received',
			dueDate: '2024-10-13T10:27:06.626Z',
			receivedAt: '2024-08-02T10:27:06.626Z',
			representationStatus: 'awaiting_review'
		}
	},
	environmentalAssessment: {
		caseId: '1',
		folderId: 17935,
		path: 'appellant-case/environmentalAssessment',
		documents: []
	},
	assignedTeamId: 1,
	assignedTeam: { name: 'Test Team', email: 'test@emai.com' },
	enforcementNotice: {
		appellantCase: {
			contactAddress: {
				addressId: 1,
				addressLine1: '96 The Avenue',
				addressLine2: 'Maidstone',
				addressCounty: 'Kent',
				postCode: 'MD21 5XY'
			}
		}
	}
};

export const appealDataIssuedDecision = {
	...appealData,
	completedStateList: ['final_comments', 'event', 'awaiting_event', 'issue_determination']
};

export const publishedAppealData = {
	...appealData,
	appealId: 2,
	appellantCaseId: 2,
	appealReference: 'APP/Q9999/D/21/SHAREDTEST',
	appealStatus: 'statements',
	documentationSummary: {
		...appealData.documentationSummary,
		ipComments: {
			counts: {
				published: 2,
				awaiting_review: 0,
				valid: 0,
				invalid: 0
			}
		}
	}
};

export const appealDataFullPlanning = {
	...appealData,
	appealType: 'Planning appeal'
};

export const appealDataListedBuilding = {
	...appealData,
	appealType: 'Planning listed building and conservation area appeal'
};

export const appealDataCasPlanning = {
	...appealData,
	appealType: 'CAS planning'
};
export const appealDataCasAdvert = {
	...appealData,
	appealType: 'CAS advert'
};
export const appealDataAdvert = {
	...appealData,
	appealType: 'Advertisement'
};

export const appealDataEnforcementNotice = {
	...appealData,
	appealType: 'Enforcement notice appeal'
};

export const appellantCaseDataNotValidated = {
	appealId: 1,
	appealReference: 'TEST/919276',
	typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.HOUSEHOLDER_PLANNING,
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
		},
		statementCommonGround: {
			documents: [],
			folderId: 70458,
			path: 'appellant-case/statementCommonGround'
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
		areAllOwnersKnown: 'No',
		hasAttemptedToIdentifyOwners: null,
		hasToldOwners: null,
		ownsAllLand: true,
		ownsSomeLand: null,
		knowsOtherLandowners: null
	},
	siteAreaSquareMetres: '30.1',
	developmentDescription: {
		details: 'Test development description details',
		isChanged: false
	},
	validation: null,
	visibility: {
		details: null,
		isVisible: true
	},
	planningObligation: {
		hasObligation: true,
		status: 'finalised'
	},
	agriculturalHolding: {
		isPartOfAgriculturalHolding: true,
		isTenant: true,
		hasOtherTenants: false
	},
	enforcementNotice: {
		isReceived: true,
		isListedBuilding: true,
		issueDate: '2024-06-19T00:00:00.000Z',
		effectiveDate: '2024-06-20T00:00:00.000Z',
		contactPlanningInspectorateDate: '',
		reference: '1234'
	}
};

export const appellantCaseDataOwnsPartLand = {
	appealId: 1,
	appealReference: 'TEST/919276',
	typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.HOUSEHOLDER_PLANNING,
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
		},
		statementCommonGround: {
			documents: [],
			folderId: 70458,
			path: 'appellant-case/statementCommonGround'
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
		ownsAllLand: false,
		ownsSomeLand: true,
		knowsOtherLandowners: 'Some'
	},
	siteAreaSquareMetres: '30.1',
	developmentDescription: {
		details: 'Test development description details',
		isChanged: false
	},
	validation: null,
	visibility: {
		details: null,
		isVisible: true
	},
	planningObligation: {
		hasObligation: true,
		status: 'finalised'
	},
	agriculturalHolding: {
		isPartOfAgriculturalHolding: true,
		isTenant: true,
		hasOtherTenants: false
	}
};

export const lpaQuestionnaireData = {
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
	hasExtraConditions: true,
	hasOtherAppeals: null,
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
			id: 1,
			listEntry: '1234567',
			affectsListedBuilding: true
		},
		{
			id: 2,
			listEntry: '1234568',
			affectsListedBuilding: true
		},
		{
			id: 3,
			listEntry: '1234569',
			affectsListedBuilding: false
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
	appealId: 1,
	appealReference: 'APP/Q9999/D/21/30498',
	appealSite: {
		addressLine1: '92 Huntsmoor Road',
		town: 'Tadley',
		postCode: 'RG26 4BX'
	},
	communityInfrastructureLevyAdoptionDate: '2023-05-09T01:00:00.000Z',
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
					...documentFileInfo,
					name: 'ph0.jpg',
					folderId: 21,
					latestDocumentVersion: {
						...documentFileInfo.latestDocumentVersion,
						documentType: 'lpaCaseCorrespondence'
					}
				},
				{
					...documentFileInfo,
					name: 'ph1.jpg',
					folderId: 21,
					latestDocumentVersion: {
						...documentFileInfo.latestDocumentVersion,
						documentType: 'lpaCaseCorrespondence'
					}
				},
				{
					...documentFileInfo,
					name: 'ph2.jpg',
					folderId: 21,
					latestDocumentVersion: {
						...documentFileInfo.latestDocumentVersion,
						documentType: 'lpaCaseCorrespondence'
					}
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
	hasExtraConditions: true,
	hasOtherAppeals: null,
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
			listEntry: '123456',
			affectsListedBuilding: true
		},
		{
			listEntry: '123457',
			affectsListedBuilding: true
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
	consultedBodiesDetails: 'Some other people need to be consulted',
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
		name: 'The appellant does not have the right to appeal',
		hasText: false
	},
	{
		id: 24,
		name: 'Other reason',
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
		name: "LPA's decision notice is missing",
		hasText: false
	},
	{
		id: 2028,
		name: "LPA's decision notice is incorrect or incomplete",
		hasText: true
	},
	{
		id: 2029,
		name: 'Documents and/or plans referred in the application form, decision notice and appeal covering letter are missing',
		hasText: true
	},
	{
		id: 2030,
		name: 'Agricultural holding certificate and declaration have not been completed on the appeal form',
		hasText: false
	},
	{
		id: 2031,
		name: 'The original application form is missing',
		hasText: false
	},
	{
		id: 2032,
		name: 'The original application form is incomplete',
		hasText: true
	},
	{
		id: 2033,
		name: 'Statement of case and ground of appeal are missing',
		hasText: false
	},
	{
		id: 2034,
		name: 'Draft statement of common ground is missing',
		hasText: false
	},
	{
		id: 2035,
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
		id: 66,
		type: 'Householder',
		shorthand: 'HAS',
		key: APPEAL_CASE_TYPE.D,
		enabled: true,
		changeAppealType: 'Householder'
	},
	{
		id: 75,
		type: 'Planning appeal',
		shorthand: 'FPA',
		key: APPEAL_CASE_TYPE.W,
		enabled: false,
		changeAppealType: 'Planning'
	},
	{
		id: 77,
		type: 'Planning listed building and conservation area appeal',
		shorthand: 'S20',
		key: APPEAL_CASE_TYPE.Y,
		enabled: false,
		changeAppealType: 'Planning listed building and conservation area'
	},
	{
		id: 78,
		type: 'CAS advert',
		key: APPEAL_CASE_TYPE.ZA,
		enabled: false,
		changeAppealType: 'Commercial advertisement (CAS)'
	},
	{
		id: 79,
		type: 'CAS planning',
		key: APPEAL_CASE_TYPE.ZP,
		enabled: false,
		changeAppealType: 'Commercial planning (CAS)'
	}
];

export const procedureTypesData = [
	{
		id: 1,
		name: 'Written',
		key: 'written'
	},
	{
		id: 2,
		name: 'Hearing',
		key: 'hearing'
	},
	{
		id: 3,
		name: 'Inquiry',
		key: 'inquiry'
	}
];

export const inspectorDecisionData = {
	outcome: 'dismissed',
	documentId: 'e1e90a49-fab3-44b8-a21a-bb73af089f6b',
	letterDate: '2023-12-25T00:00:00.000Z'
};

export const inspectorDecisionfile = {
	outcome: 'dismissed',
	GUID: 'e1e90a49-fab3-44b8-a21a-bb73af089f6b',
	letterDate: '2023-12-25T00:00:00.000Z',
	name: 'Decision letter'
};

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
				redactionStatus: null,
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
				redactionStatus: null,
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
	itemCount: 5,
	items: [
		{
			appealId: 28535,
			appealReference: '6028535',
			appealSite: {
				addressLine1: '92 Huntsmoor Road',
				town: 'Tadley',
				postCode: 'RG26 4BX'
			},
			appealStatus: 'final_comments',
			appealType: 'Planning appeal',
			createdAt: '2025-03-04T14:30:30.831Z',
			localPlanningDepartment: 'Wiltshire Council',
			lpaQuestionnaireId: 25074,
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: null,
					receivedAt: '2025-03-04T14:30:30.831Z'
				},
				lpaQuestionnaire: {
					status: 'received',
					dueDate: '2024-08-09T22:59:00.000Z',
					receivedAt: '2023-05-08T23:00:00.000Z'
				},
				ipComments: {
					status: 'received',
					counts: {
						awaiting_review: 8,
						valid: 2,
						published: 0
					}
				},
				lpaStatement: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:35.101Z'
				},
				lpaFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				},
				appellantFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				}
			},
			dueDate: '2024-09-23T22:59:00.000Z',
			appealTimetable: {
				appealTimetableId: 26862,
				lpaQuestionnaireDueDate: '2024-08-09T22:59:00.000Z',
				caseResubmissionDueDate: null,
				ipCommentsDueDate: '2024-09-09T22:59:00.000Z',
				appellantStatementDueDate: '2024-09-09T22:59:00.000Z',
				lpaStatementDueDate: '2024-09-09T22:59:00.000Z',
				finalCommentsDueDate: '2024-09-23T22:59:00.000Z',
				s106ObligationDueDate: '2024-09-23T22:59:00.000Z',
				issueDeterminationDate: null
			},
			isParentAppeal: true,
			isChildAppeal: false,
			numberOfResidencesNetChange: 5
		},
		{
			appealId: 28524,
			appealReference: '6028524',
			appealSite: {
				addressLine1: '92 Huntsmoor Road',
				town: 'Tadley',
				postCode: 'RG26 4BX'
			},
			appealStatus: 'lpa_questionnaire',
			appealType: 'Planning appeal',
			createdAt: '2025-03-04T14:30:30.496Z',
			localPlanningDepartment: 'System Test Borough Council 2',
			lpaQuestionnaireId: 25063,
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: null,
					receivedAt: '2025-03-04T14:30:30.496Z'
				},
				lpaQuestionnaire: {
					status: 'received',
					dueDate: '2025-01-10T23:59:00.000Z',
					receivedAt: '2023-05-08T23:00:00.000Z'
				},
				ipComments: {
					status: 'received',
					counts: {
						awaiting_review: 5,
						valid: 2,
						published: 0
					}
				},
				lpaStatement: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:33.538Z'
				},
				lpaFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				},
				appellantFinalComments: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:33.544Z',
					representationStatus: 'awaiting_review',
					counts: {
						awaiting_review: 1,
						valid: 0,
						published: 0
					}
				}
			},
			dueDate: '2025-01-10T23:59:00.000Z',
			appealTimetable: {
				appealTimetableId: 26851,
				lpaQuestionnaireDueDate: '2025-01-10T23:59:00.000Z',
				caseResubmissionDueDate: null,
				ipCommentsDueDate: '2025-02-07T23:59:00.000Z',
				appellantStatementDueDate: '2025-02-07T23:59:00.000Z',
				lpaStatementDueDate: '2025-02-07T23:59:00.000Z',
				finalCommentsDueDate: '2025-02-21T23:59:00.000Z',
				s106ObligationDueDate: '2025-02-21T23:59:00.000Z',
				issueDeterminationDate: null
			},
			isParentAppeal: false,
			isChildAppeal: true,
			numberOfResidencesNetChange: 5
		},
		{
			appealId: 28526,
			appealReference: '6028526',
			appealSite: {
				addressLine1: '8 The Chase',
				town: 'Findon',
				postCode: 'BN14 0TT'
			},
			appealStatus: 'statements',
			appealType: 'Planning appeal',
			createdAt: '2025-03-04T14:30:30.563Z',
			localPlanningDepartment: 'Maidstone Borough Council',
			lpaQuestionnaireId: 25065,
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: null,
					receivedAt: '2025-03-04T14:30:30.563Z'
				},
				lpaQuestionnaire: {
					status: 'received',
					dueDate: '2025-01-10T23:59:00.000Z',
					receivedAt: '2023-05-08T23:00:00.000Z'
				},
				ipComments: {
					status: 'received',
					counts: {
						awaiting_review: 5,
						valid: 3,
						published: 0
					}
				},
				lpaStatement: {
					status: 'incomplete',
					receivedAt: '2025-03-04T14:30:33.805Z'
				},
				lpaFinalComments: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:33.821Z',
					representationStatus: 'awaiting_review',
					counts: {
						awaiting_review: 1,
						valid: 0,
						published: 0
					}
				},
				appellantFinalComments: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:33.813Z',
					representationStatus: 'awaiting_review',
					counts: {
						awaiting_review: 1,
						valid: 0,
						published: 0
					}
				}
			},
			dueDate: '2025-02-07T23:59:00.000Z',
			appealTimetable: {
				appealTimetableId: 26853,
				lpaQuestionnaireDueDate: '2025-01-10T23:59:00.000Z',
				caseResubmissionDueDate: null,
				ipCommentsDueDate: '2025-04-07T22:59:00.000Z',
				appellantStatementDueDate: '2025-02-07T23:59:00.000Z',
				lpaStatementDueDate: '2025-02-07T23:59:00.000Z',
				finalCommentsDueDate: '2025-02-21T23:59:00.000Z',
				s106ObligationDueDate: '2025-02-21T23:59:00.000Z',
				issueDeterminationDate: null
			},
			isParentAppeal: false,
			isChildAppeal: false,
			numberOfResidencesNetChange: 5
		},
		{
			appealId: 28512,
			appealReference: '6028512',
			appealSite: {
				addressLine1: 'Copthalls',
				addressLine2: 'Clevedon Road',
				town: 'West Hill',
				postCode: 'BS48 1PN'
			},
			appealStatus: 'ready_to_start',
			appealType: 'Planning appeal',
			createdAt: '2025-03-04T14:30:30.083Z',
			localPlanningDepartment: 'Worthing Borough Council',
			lpaQuestionnaireId: null,
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: null,
					receivedAt: '2025-03-04T14:30:30.083Z'
				},
				lpaQuestionnaire: {
					status: 'not_received'
				},
				ipComments: {
					status: 'received',
					counts: {
						awaiting_review: 9,
						valid: 0,
						published: 0
					}
				},
				lpaStatement: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:31.842Z'
				},
				lpaFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				},
				appellantFinalComments: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:31.852Z',
					representationStatus: 'awaiting_review',
					counts: {
						awaiting_review: 1,
						valid: 0,
						published: 0
					}
				}
			},
			dueDate: '2025-03-09T14:30:30.083Z',
			isParentAppeal: false,
			isChildAppeal: false,
			numberOfResidencesNetChange: 5
		},
		{
			appealId: 28515,
			appealReference: '6028515',
			appealSite: {
				addressLine1: '44 Rivervale',
				town: 'Bridport',
				postCode: 'DT6 5RN'
			},
			appealStatus: 'validation',
			appealType: 'Planning appeal',
			createdAt: '2025-03-04T14:30:30.165Z',
			localPlanningDepartment: 'Bristol City Council',
			lpaQuestionnaireId: 25054,
			documentationSummary: {
				appellantCase: {
					status: 'received',
					dueDate: null,
					receivedAt: '2025-03-04T14:30:30.165Z'
				},
				lpaQuestionnaire: {
					status: 'received',
					receivedAt: '2023-05-08T23:00:00.000Z'
				},
				ipComments: {
					status: 'received',
					counts: {
						awaiting_review: 7,
						valid: 1,
						published: 0
					}
				},
				lpaStatement: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:32.273Z'
				},
				lpaFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				},
				appellantFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				}
			},
			isParentAppeal: false,
			isChildAppeal: false,
			numberOfResidencesNetChange: 5
		}
	],
	statuses: ['final_comments', 'lpa_questionnaire', 'statements', 'ready_to_start', 'validation'],
	page: 1,
	pageCount: 3,
	pageSize: 5
};

export const assignedAppealsPage2 = {
	itemCount: 5,
	items: [
		{
			appealId: 28513,
			appealReference: '6028513',
			appealSite: {
				addressLine1: '19 Beauchamp Road',
				town: 'Bristol',
				postCode: 'BS7 8LQ'
			},
			appealStatus: 'awaiting_transfer',
			appealType: 'Planning appeal',
			createdAt: '2025-03-04T14:30:30.111Z',
			localPlanningDepartment: 'Barnsley Metropolitan Borough Council',
			lpaQuestionnaireId: null,
			documentationSummary: {
				appellantCase: {
					status: 'received',
					dueDate: null,
					receivedAt: '2025-03-04T14:30:30.111Z'
				},
				lpaQuestionnaire: {
					status: 'not_received'
				},
				ipComments: {
					status: 'received',
					counts: {
						awaiting_review: 6,
						valid: 1,
						published: 0
					}
				},
				lpaStatement: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:31.998Z'
				},
				lpaFinalComments: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:32.005Z',
					representationStatus: 'awaiting_review',
					counts: {
						awaiting_review: 1,
						valid: 0,
						published: 0
					}
				},
				appellantFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				}
			},
			isParentAppeal: false,
			isChildAppeal: false,
			numberOfResidencesNetChange: 5
		},
		{
			appealId: 28510,
			appealReference: '6028510',
			appealSite: {
				addressLine1: 'FOR TRAINERS ONLY',
				addressLine2: '19 Beauchamp Road',
				town: 'Bristol',
				postCode: 'BS7 8LQ'
			},
			appealStatus: 'event',
			procedureType: APPEAL_CASE_PROCEDURE.WRITTEN,
			appealType: 'Householder',
			createdAt: '2025-03-04T14:30:30.013Z',
			localPlanningDepartment: 'Worthing Borough Council',
			lpaQuestionnaireId: 25053,
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: null,
					receivedAt: '2025-03-04T14:30:30.013Z'
				},
				lpaQuestionnaire: {
					status: 'Complete',
					dueDate: '2025-03-11T23:59:00.000Z',
					receivedAt: '2023-05-08T23:00:00.000Z'
				},
				ipComments: {
					status: 'not_received',
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				},
				lpaStatement: {
					status: 'not_received'
				},
				lpaFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				},
				appellantFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				}
			},
			appealTimetable: {
				appealTimetableId: 26843,
				lpaQuestionnaireDueDate: '2025-03-11T23:59:00.000Z',
				caseResubmissionDueDate: null
			},
			isParentAppeal: false,
			isChildAppeal: false,
			numberOfResidencesNetChange: 5
		},
		{
			appealId: 28525,
			appealReference: '6028525',
			appealSite: {
				addressLine1: '96 The Avenue',
				addressLine2: 'Maidstone',
				county: 'Kent',
				postCode: 'MD21 5XY'
			},
			appealStatus: 'lpa_questionnaire',
			appealType: 'Planning appeal',
			createdAt: '2025-03-04T14:30:30.528Z',
			localPlanningDepartment: 'Wiltshire Council',
			lpaQuestionnaireId: 25064,
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: null,
					receivedAt: '2025-03-04T14:30:30.528Z'
				},
				lpaQuestionnaire: {
					status: 'Incomplete',
					dueDate: '2025-04-09T23:00:00.000Z',
					receivedAt: '2023-05-08T23:00:00.000Z'
				},
				ipComments: {
					status: 'received',
					counts: {
						awaiting_review: 8,
						valid: 1,
						published: 0
					}
				},
				lpaStatement: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:33.665Z'
				},
				lpaFinalComments: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:33.673Z',
					representationStatus: 'awaiting_review',
					counts: {
						awaiting_review: 1,
						valid: 0,
						published: 0
					}
				},
				appellantFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				}
			},
			dueDate: '2025-04-09T23:00:00.000Z',
			appealTimetable: {
				appealTimetableId: 26852,
				lpaQuestionnaireDueDate: '2025-04-09T23:00:00.000Z',
				caseResubmissionDueDate: null,
				ipCommentsDueDate: '2025-02-07T23:59:00.000Z',
				appellantStatementDueDate: '2025-02-07T23:59:00.000Z',
				lpaStatementDueDate: '2025-02-07T23:59:00.000Z',
				finalCommentsDueDate: '2025-02-21T23:59:00.000Z',
				s106ObligationDueDate: '2025-02-21T23:59:00.000Z',
				issueDeterminationDate: null
			},
			isParentAppeal: false,
			isChildAppeal: false,
			numberOfResidencesNetChange: 5
		},
		{
			appealId: 28531,
			appealReference: '6028531',
			appealSite: {
				addressLine1: '96 The Avenue',
				addressLine2: 'Maidstone',
				county: 'Kent',
				postCode: 'MD21 5XY'
			},
			appealStatus: 'final_comments',
			appealType: 'Planning appeal',
			createdAt: '2025-03-04T14:30:30.710Z',
			localPlanningDepartment: 'Barnsley Metropolitan Borough Council',
			lpaQuestionnaireId: 25070,
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: null,
					receivedAt: '2025-03-04T14:30:30.710Z'
				},
				lpaQuestionnaire: {
					status: 'received',
					dueDate: '2024-11-11T23:59:00.000Z',
					receivedAt: '2023-05-08T23:00:00.000Z'
				},
				ipComments: {
					status: 'received',
					counts: {
						awaiting_review: 3,
						valid: 3,
						published: 0
					}
				},
				lpaStatement: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:34.533Z'
				},
				lpaFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				},
				appellantFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				}
			},
			dueDate: '2025-12-23T23:59:00.000Z',
			appealTimetable: {
				appealTimetableId: 26858,
				lpaQuestionnaireDueDate: '2024-11-11T23:59:00.000Z',
				caseResubmissionDueDate: null,
				ipCommentsDueDate: '2024-12-09T23:59:00.000Z',
				appellantStatementDueDate: '2024-12-09T23:59:00.000Z',
				lpaStatementDueDate: '2024-12-09T23:59:00.000Z',
				finalCommentsDueDate: '2025-12-23T23:59:00.000Z',
				s106ObligationDueDate: '2024-12-23T23:59:00.000Z',
				issueDeterminationDate: null
			},
			isParentAppeal: false,
			isChildAppeal: false,
			numberOfResidencesNetChange: 5
		},
		{
			appealId: 28533,
			appealReference: '6028533',
			appealSite: {
				addressLine1: '8 The Chase',
				town: 'Findon',
				postCode: 'BN14 0TT'
			},
			appealStatus: 'final_comments',
			appealType: 'Planning appeal',
			createdAt: '2025-03-04T14:30:30.772Z',
			localPlanningDepartment: 'Barnsley Metropolitan Borough Council',
			lpaQuestionnaireId: 25072,
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: null,
					receivedAt: '2025-03-04T14:30:30.772Z'
				},
				lpaQuestionnaire: {
					status: 'received',
					dueDate: '2025-02-11T23:59:00.000Z',
					receivedAt: '2023-05-08T23:00:00.000Z'
				},
				ipComments: {
					status: 'received',
					counts: {
						awaiting_review: 5,
						valid: 2,
						published: 0
					}
				},
				lpaStatement: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:34.814Z'
				},
				lpaFinalComments: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:34.825Z',
					representationStatus: 'awaiting_review',
					counts: {
						awaiting_review: 1,
						valid: 0,
						published: 0
					}
				},
				appellantFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null,
					counts: {
						awaiting_review: 0,
						valid: 0,
						published: 0
					}
				}
			},
			dueDate: '2025-03-25T23:59:00.000Z',
			appealTimetable: {
				appealTimetableId: 26860,
				lpaQuestionnaireDueDate: '2025-02-11T23:59:00.000Z',
				caseResubmissionDueDate: null,
				ipCommentsDueDate: '2025-03-11T23:59:00.000Z',
				appellantStatementDueDate: '2025-03-11T23:59:00.000Z',
				lpaStatementDueDate: '2025-03-11T23:59:00.000Z',
				finalCommentsDueDate: '2025-03-25T23:59:00.000Z',
				s106ObligationDueDate: '2025-03-25T23:59:00.000Z',
				issueDeterminationDate: null
			},
			isParentAppeal: false,
			isChildAppeal: false,
			numberOfResidencesNetChange: 5
		}
	],
	statuses: ['awaiting_transfer', 'event', 'lpa_questionnaire', 'final_comments'],
	page: 2,
	pageCount: 3,
	pageSize: 5
};

export const assignedAppealsPage3 = {
	itemCount: 1,
	items: [
		{
			appealId: 28514,
			appealReference: '6028514',
			appealSite: {
				addressLine1: 'FOR TRAINERS ONLY',
				addressLine2: '1 Grove Cottage',
				town: 'Woodton',
				postCode: 'NR35 2ND'
			},
			appealStatus: 'lpa_questionnaire',
			appealType: 'Planning appeal',
			createdAt: '2025-03-04T14:30:30.139Z',
			localPlanningDepartment: 'System Test Borough Council 2',
			lpaQuestionnaireId: null,
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: null,
					receivedAt: '2025-03-04T14:30:30.139Z'
				},
				lpaQuestionnaire: {
					status: 'not_received',
					dueDate: '2025-03-11T23:59:00.000Z'
				},
				ipComments: {
					status: 'received',
					counts: {
						awaiting_review: 5,
						valid: 4,
						published: 0
					}
				},
				lpaStatement: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:32.129Z'
				},
				lpaFinalComments: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:32.146Z',
					representationStatus: 'awaiting_review',
					counts: {
						awaiting_review: 1,
						valid: 0,
						published: 0
					}
				},
				appellantFinalComments: {
					status: 'received',
					receivedAt: '2025-03-04T14:30:32.138Z',
					representationStatus: 'awaiting_review',
					counts: {
						awaiting_review: 1,
						valid: 0,
						published: 0
					}
				}
			},
			dueDate: '2025-03-11T23:59:00.000Z',
			appealTimetable: {
				appealTimetableId: 26864,
				lpaQuestionnaireDueDate: '2025-03-11T23:59:00.000Z',
				caseResubmissionDueDate: null,
				ipCommentsDueDate: '2025-04-08T22:59:00.000Z',
				appellantStatementDueDate: '2025-04-08T22:59:00.000Z',
				lpaStatementDueDate: '2025-04-08T22:59:00.000Z',
				finalCommentsDueDate: '2025-04-24T22:59:00.000Z',
				s106ObligationDueDate: '2025-04-24T22:59:00.000Z',
				issueDeterminationDate: null
			},
			isParentAppeal: false,
			isChildAppeal: false
		}
	],
	statuses: ['lpa_questionnaire'],
	page: 3,
	pageCount: 3,
	pageSize: 5
};

export const assignedAppealsInFinalCommentsStatus = {
	itemCount: 1,
	items: [
		{
			appealId: 24281,
			appealReference: '6024281',
			appealSite: {
				addressLine1: '8 The Chase',
				postCode: 'BN14 0TT',
				town: 'Findon'
			},
			appealStatus: 'final_comments',
			appealType: 'Planning appeal',
			createdAt: '2025-01-29T10:19:47.259Z',
			localPlanningDepartment: 'Maidstone Borough Council',
			lpaQuestionnaireId: 21447,
			documentationSummary: {
				appellantCase: {
					dueDate: null,
					receivedAt: '2025-01-29T10:19:47.259Z',
					status: 'Valid'
				},
				appellantFinalComments: {
					receivedAt: null,
					representationStatus: null,
					status: 'not_received'
				},
				ipComments: {
					status: 'received'
				},
				lpaFinalComments: {
					receivedAt: null,
					representationStatus: null,
					status: 'not_received'
				},
				lpaQuestionnaire: {
					dueDate: '2024-07-05T22:59:00.000Z',
					receivedAt: '2023-05-08T23:00:00.000Z',
					status: 'received'
				},
				lpaStatement: {
					receivedAt: '2025-01-29T10:19:51.271Z',
					status: 'received'
				}
			},
			dueDate: '2024-08-16T22:59:00.000Z',
			appealTimetable: {
				appealTimetableId: 22293,
				appellantFinalCommentsDueDate: '2024-08-16T22:59:00.000Z',
				appellantStatementDueDate: '2024-08-02T22:59:00.000Z',
				caseResubmissionDueDate: null,
				ipCommentsDueDate: '2024-08-02T22:59:00.000Z',
				issueDeterminationDate: null,
				lpaFinalCommentsDueDate: '2024-08-16T22:59:00.000Z',
				lpaQuestionnaireDueDate: '2024-07-05T22:59:00.000Z',
				lpaStatementDueDate: '2024-08-02T22:59:00.000Z',
				s106ObligationDueDate: '2024-08-16T22:59:00.000Z'
			},
			isParentAppeal: false,
			isChildAppeal: false
		}
	],
	statuses: ['lpa_questionnaire', 'final_comments'],
	page: 1,
	pageCount: 1,
	pageSize: 30
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
				redactionStatus: 'No redaction required',
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

export const folderInfoMainPartyCorrespondence = {
	...costsFolderInfoAppellantApplication,
	folderId: 22,
	path: 'internal/mainPartyCorrespondence'
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
		redactionStatusId: 0,
		redacted: false,
		documentURI:
			'https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploads/appeal/6014692/d2197025-5edb-4477-8e98-2a1bf13ed2ea/v1/test-doc-alternate.docx'
	}
};

export const fileUploadInfo =
	'[{"name": "test-document.txt", "GUID": "1", "fileRowId": "1", "blobStoreUrl": "/", "mimeType": "txt", "documentType": "txt", "size": 1, "stage": "appellant-case", "redactionStatus": 3}]';

export const fileUploadInfo2 =
	'[{"name": "test-document2.txt", "GUID": "100", "fileRowId": "2", "blobStoreUrl": "/", "mimeType": "txt", "documentType": "txt", "size": 1, "stage": "appellant-case", "redactionStatus": 3}]';

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
						redactionStatus: 'no_redaction_required',
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

export const interestedPartyCommentsAwaitingReview = {
	itemCount: 3,
	items: [
		{
			id: 3812,
			source: 'citizen',
			author: 'Eva Sharma',
			status: 'awaiting_review',
			originalRepresentation: 'Awaiting review comment 1',
			redactedRepresentation: '',
			created: '2024-09-24T10:36:25.774Z',
			notes: '',
			attachments: []
		},
		{
			id: 3811,
			source: 'citizen',
			author: 'Roger Simmons',
			status: 'awaiting_review',
			originalRepresentation: 'Awaiting review comment 2',
			redactedRepresentation: '',
			created: '2024-09-24T10:36:25.770Z',
			notes: '',
			attachments: []
		},
		{
			id: 3810,
			source: 'citizen',
			author: 'Roger Simmons',
			status: 'awaiting_review',
			originalRepresentation: 'Awaiting review comment 3',
			redactedRepresentation: '',
			created: '2024-09-24T10:36:25.767Z',
			notes: '',
			attachments: []
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 1000
};

export const interestedPartyCommentsValid = {
	itemCount: 3,
	items: [
		{
			id: 3852,
			source: 'citizen',
			author: 'Roger Simmons',
			status: 'valid',
			originalRepresentation: 'Valid comment 1',
			redactedRepresentation: '',
			created: '2024-09-24T10:36:25.933Z',
			notes: '',
			attachments: []
		},
		{
			id: 3851,
			source: 'citizen',
			author: 'Roger Simmons',
			status: 'valid',
			originalRepresentation: 'Valid comment 2',
			redactedRepresentation: '',
			created: '2024-09-24T10:36:25.928Z',
			notes: '',
			attachments: []
		},
		{
			id: 3850,
			source: 'citizen',
			author: 'Haley Eland',
			status: 'valid',
			originalRepresentation: 'Valid comment 3',
			redactedRepresentation: '',
			created: '2024-09-24T10:36:25.922Z',
			notes: '',
			attachments: []
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 1000
};

export const interestedPartyCommentsInvalid = {
	itemCount: 3,
	items: [
		{
			id: 3872,
			source: 'citizen',
			author: 'Ryan Marshall',
			status: 'invalid',
			originalRepresentation: 'Invalid comment 1',
			redactedRepresentation: '',
			created: '2024-09-24T10:36:26.033Z',
			notes: '',
			attachments: []
		},
		{
			id: 3871,
			source: 'citizen',
			author: 'Ryan Marshall',
			status: 'invalid',
			originalRepresentation: 'Invalid comment 2',
			redactedRepresentation: '',
			created: '2024-09-24T10:36:26.027Z',
			notes: '',
			attachments: []
		},
		{
			id: 3870,
			source: 'citizen',
			author: 'Eva Sharma',
			status: 'invalid',
			originalRepresentation: 'Invalid comment 3',
			redactedRepresentation: '',
			created: '2024-09-24T10:36:26.022Z',
			notes: '',
			attachments: []
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 1000
};

export const interestedPartyCommentsForReview = {
	itemCount: 1,
	items: [
		{
			id: 3670,
			source: 'citizen',
			author: 'Lee Thornton',
			status: 'awaiting_review',
			originalRepresentation: 'Awaiting final comment',
			redactedRepresentation: '',
			created: '2024-10-09T17:23:24.406Z',
			notes: '',
			attachments: [],
			representationType: 'comment',
			siteVisitRequested: false,
			represented: {
				id: 3838,
				name: 'Lee Thornton',
				email: 'test1@example.com',
				address: {
					addressLine1: '',
					postCode: ''
				}
			}
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

export const interestedPartyCommentsForView = {
	itemCount: 1,
	items: [
		{
			id: 3670,
			source: 'citizen',
			author: 'Lee Thornton',
			status: 'valid',
			originalRepresentation: 'Awaiting review final comment',
			redactedRepresentation: '',
			created: '2024-10-09T17:23:24.406Z',
			notes: '',
			attachments: [],
			representationType: 'comment',
			siteVisitRequested: false,
			represented: {
				id: 3838,
				name: 'Lee Thornton',
				email: 'test1@example.com',
				address: {
					addressLine1: '',
					postCode: ''
				}
			}
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

export const interestedPartyCommentForReview = {
	id: 3670,
	source: 'citizen',
	author: 'Lee Thornton',
	status: 'awaiting_review',
	originalRepresentation: 'Awaiting review comment 47',
	redactedRepresentation: '',
	created: '2024-10-09T17:23:24.406Z',
	notes: '',
	attachments: [],
	representationType: 'comment',
	siteVisitRequested: false,
	represented: {
		id: 3838,
		name: 'Lee Thornton',
		email: 'test1@example.com',
		address: {
			addressLine1: '',
			postCode: ''
		}
	}
};

export const interestedPartyCommentsPublished = {
	itemCount: 2, // Example: 2 published comments
	items: [
		{
			id: 5001,
			source: 'citizen',
			author: 'Alice Wonderland',
			status: 'published',
			originalRepresentation: 'Comment 1',
			redactedRepresentation: '',
			created: '2025-04-01T09:15:00.000Z',
			notes: 'Some internal notes if applicable',
			attachments: [],
			represented: {
				id: 3838,
				name: 'Lee Thornton',
				email: 'test1@example.com',
				address: {
					addressLine1: '',
					postCode: ''
				}
			}
		},
		{
			id: 5002,
			source: 'organisation',
			author: 'Cheshire Cat Council',
			status: 'published',
			originalRepresentation: 'Comment 2',
			redactedRepresentation: null,
			created: '2025-04-02T14:05:30.000Z',
			notes: '',
			attachments: [],
			represented: {
				id: 3838,
				name: 'Lee Thornton',
				email: 'test1@example.com',
				address: {
					addressLine1: '',
					postCode: ''
				}
			}
		}
	],
	page: 1,
	pageCount: 1, // Assuming all items fit on one page for this mock
	pageSize: 25 // Example page size (should match service default or query)
};

export const finalCommentsTypes = [
	{
		type: 'appellant',
		label: 'appellant'
	},
	{
		type: 'lpa',
		label: 'LPA'
	}
];

export const finalCommentsForReview = {
	itemCount: 1,
	items: [
		{
			id: 3670,
			source: 'citizen',
			author: 'Lee Thornton',
			status: 'awaiting_review',
			originalRepresentation: 'Awaiting final comments review',
			redactedRepresentation: '',
			created: '2024-10-09T17:23:24.406Z',
			notes: '',
			attachments: [],
			representationType: 'lpa_final_comment',
			siteVisitRequested: false,
			represented: {
				id: 3838,
				name: 'Lee Thornton',
				email: 'test1@example.com',
				address: {
					addressLine1: '',
					postCode: ''
				}
			}
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

export const finalCommentsForReviewWithAttachments = {
	itemCount: 1,
	items: [
		{
			id: 3670,
			source: 'citizen',
			author: 'Lee Thornton',
			status: 'awaiting_review',
			originalRepresentation: 'Awaiting final comments review',
			redactedRepresentation: '',
			created: '2024-10-09T17:23:24.406Z',
			notes: '',
			representationType: 'lpa_final_comment',
			siteVisitRequested: false,
			attachments: [
				{
					documentVersion: {
						document: {
							caseId: '4881',
							folderId: 135568,
							guid: 'ed52cdc1-3cc2-462a-8623-c1ae256969d6',
							name: 'blank copy 5.pdf',
							isDeleted: false
						}
					}
				},
				{
					documentVersion: {
						document: {
							caseId: '4881',
							folderId: 135568,
							guid: 'ceb49369-01d4-479b-84f5-50136e7ceb6f',
							name: 'deleted_file.pdf',
							isDeleted: true
						}
					}
				}
			],
			represented: {
				id: 3838,
				name: 'Lee Thornton',
				email: 'test1@example.com',
				address: {
					addressLine1: '',
					postCode: ''
				}
			}
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

export const appellantFinalCommentsAwaitingReview = {
	itemCount: 1,
	items: [
		{
			id: 46419,
			author: 'Eva Sharma',
			status: 'awaiting_review',
			originalRepresentation:
				'Final comment from appellant. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
			redactedRepresentation: '',
			created: '2025-01-21T14:35:04.205Z',
			notes: 'test notes',
			attachments: [],
			representationType: 'appellant_final_comment',
			siteVisitRequested: false,
			source: 'citizen',
			represented: {
				id: 50577,
				name: 'Eva Sharma',
				email: 'test9@example.com',
				address: {
					addressLine1: '',
					postCode: ''
				}
			},
			rejectionReasons: []
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

export const lpaFinalCommentsAwaitingReview = {
	itemCount: 1,
	items: [
		{
			id: 46420,
			source: 'lpa',
			author: 'Worthing Borough Council',
			status: 'awaiting_review',
			originalRepresentation:
				'Final comment from LPA. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
			redactedRepresentation: '',
			created: '2025-01-21T14:35:04.213Z',
			notes: 'test notes',
			attachments: [],
			representationType: 'lpa_final_comment',
			siteVisitRequested: false,
			rejectionReasons: []
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

export const lpaStatementAwaitingReview = {
	id: 66816,
	source: 'lpa',
	author: 'Wiltshire Council',
	status: 'awaiting_review',
	originalRepresentation: `Every single thing in the world has its own personality - and it is up to you to make friends with the little rascals. Steve wants reflections, so let's give him eflections It's amazing what you can do with a little love in your heart. Clouds are free they come and go as they please.\n\nThe secret to doing anything is believing that you can do it. Anything hatyou believe you can do strong enough, you can do. Anything. As long as you believe. It looks so good, I might as well not stop. This present moment is perfect simply due to the fact you're xperiencingit. Making all those little fluffies that live in the clouds.\n\nYou don't want to kill all your dark areas they are very important. I will take some magic white, and a little bit of andykebrown and a little touch of yellow. Anyone can paint. Each highlight must have it's own private shadow. Don't fiddle with it all day.`,
	redactedRepresentation: '',
	created: '2025-03-20T12:00:20.709Z',
	notes: '',
	attachments: [],
	representationType: 'lpa_statement',
	siteVisitRequested: false,
	rejectionReasons: []
};

export const proofOfEvidenceForReview = {
	itemCount: 1,
	items: [
		{
			id: 3670,
			source: 'citizen',
			author: 'Lee Thornton',
			status: 'awaiting_review',
			originalRepresentation: 'Awaiting proof of evidence review',
			redactedRepresentation: '',
			created: '2024-10-09T17:23:24.406Z',
			notes: '',
			attachments: [],
			representationType: 'lpa_proofs_evidence',
			siteVisitRequested: false,
			represented: {
				id: 3838,
				name: 'Lee Thornton',
				email: 'test1@example.com',
				address: {
					addressLine1: '',
					postCode: ''
				}
			}
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

export const proofOfEvidenceForReviewWithAttachments = {
	itemCount: 1,
	items: [
		{
			id: 3670,
			source: 'citizen',
			author: 'Lee Thornton',
			status: 'awaiting_review',
			originalRepresentation: 'Awaiting proof of evidence review',
			redactedRepresentation: '',
			created: '2024-10-09T17:23:24.406Z',
			notes: '',
			representationType: 'lpa_proofs_evidence',
			siteVisitRequested: false,
			attachments: [
				{
					documentVersion: {
						document: {
							caseId: '4881',
							folderId: 135568,
							guid: 'ed52cdc1-3cc2-462a-8623-c1ae256969d6',
							name: 'blank copy 5.pdf',
							isDeleted: false
						}
					}
				},
				{
					documentVersion: {
						document: {
							caseId: '4881',
							folderId: 135568,
							guid: 'ceb49369-01d4-479b-84f5-50136e7ceb6f',
							name: 'deleted_file.pdf',
							isDeleted: true
						}
					}
				}
			],
			represented: {
				id: 3838,
				name: 'Lee Thornton',
				email: 'test1@example.com',
				address: {
					addressLine1: '',
					postCode: ''
				}
			}
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

export const appellantProofOfEvidenceAwaitingReview = {
	itemCount: 1,
	items: [
		{
			id: 46419,
			author: 'Eva Sharma',
			status: 'awaiting_review',
			redactedRepresentation: '',
			created: '2025-01-21T14:35:04.205Z',
			notes: 'test notes',
			attachments: [],
			representationType: 'appellant_proofs_evidence',
			siteVisitRequested: false,
			source: 'citizen',
			represented: {
				id: 50577,
				name: 'Eva Sharma',
				email: 'test9@example.com',
				address: {
					addressLine1: '',
					postCode: ''
				}
			},
			rejectionReasons: []
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

export const lpaProofOfEvidenceAwaitingReview = {
	itemCount: 1,
	items: [
		{
			id: 46420,
			source: 'lpa',
			author: 'Worthing Borough Council',
			status: 'awaiting_review',
			redactedRepresentation: '',
			created: '2025-01-21T14:35:04.213Z',
			notes: 'test notes',
			attachments: [],
			representationType: 'lpa_proofs_evidence',
			siteVisitRequested: false,
			rejectionReasons: []
		}
	],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

export const getAppealRepsResponse = {
	itemCount: 0,
	items: [],
	page: 1,
	pageCount: 1,
	pageSize: 30
};

export const interestedPartyCommentForView = {
	id: 3670,
	source: 'citizen',
	author: 'Lee Thornton',
	status: 'valid',
	originalRepresentation: 'Awaiting review comment 47',
	redactedRepresentation: '',
	created: '2024-10-09T17:23:24.406Z',
	notes: '',
	attachments: [],
	representationType: 'comment',
	siteVisitRequested: false,
	represented: {
		id: 3838,
		name: 'Lee Thornton',
		email: 'test1@example.com',
		address: {
			addressLine1: '',
			postCode: ''
		}
	}
};

export const representationRejectionReasons = [
	{
		id: 1,
		name: 'Received after deadline',
		hasText: false
	},
	{
		id: 2,
		name: 'Includes personal and/or medical information',
		hasText: false
	},
	{
		id: 3,
		name: 'Includes inflammatory content',
		hasText: false
	},
	{
		id: 4,
		name: 'Duplicated comment',
		hasText: false
	},
	{
		id: 5,
		name: 'Not relevant to this appeal',
		hasText: false
	},
	{
		id: 6,
		name: 'Contains links to web pages',
		hasText: false
	},
	{
		id: 7,
		name: 'Other',
		hasText: true
	}
];

export const lpaProofOfEvidenceIncompleteReasons = [
	{
		id: 1,
		name: 'Not complete',
		representationType: 'lpa_proofs_evidence',
		hasText: false
	},
	{
		id: 2,
		name: 'Not relevant',
		representationType: 'lpa_proofs_evidence',
		hasText: false
	},
	{
		id: 3,
		name: 'Other reason',
		representationType: 'lpa_proofs_evidence',
		hasText: true
	}
];

export const shareRepsResponseFinalComment = {
	id: 1,
	appealId: 1,
	representationType: 'appellant_final_comment',
	dateCreated: '2025-02-18T13:17:24.741Z',
	dateLastUpdated: '2025-02-18T13:19:05.714Z',
	originalRepresentation:
		'Final comment from appellant. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
	redactedRepresentation: null,
	representedId: 1,
	representativeId: null,
	lpaCode: null,
	status: 'published',
	reviewer: null,
	notes: null,
	siteVisitRequested: false,
	source: 'citizen'
};

const pastDate = '2025-01-06T23:59:00.000Z';
const futureDate = '3000-01-06T23:59:00.000Z';
export const baseAppealDataToGetRequiredActions = {
	appealId: 1,
	lpaQuestionnaireId: 1
};

export const appealDataToGetRequiredActions = {
	addHorizonReference: {
		...baseAppealDataToGetRequiredActions,
		lpaQuestionnaireId: 1,
		appealStatus: APPEAL_CASE_STATUS.AWAITING_TRANSFER
	},
	arrangeSiteVisit: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.EVENT,
		procedureType: APPEAL_CASE_PROCEDURE.WRITTEN
	},
	assignCaseOfficer: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER
	},
	awaitingAppellantUpdate: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.VALIDATION,
		documentationSummary: {
			appellantCase: {
				dueDate: futureDate,
				status: VALIDATION_OUTCOME_INCOMPLETE
			}
		}
	},
	awaitingFinalComments: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.FINAL_COMMENTS,
		appealTimetable: {
			finalCommentsDueDate: futureDate
		},
		documentationSummary: {
			appellantFinalComments: {
				status: DOCUMENT_STATUS_NOT_RECEIVED
			},
			lpaFinalComments: {
				status: DOCUMENT_STATUS_NOT_RECEIVED
			}
		}
	},
	awaitingIpComments: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.STATEMENTS,
		appealTimetable: {
			ipCommentsDueDate: futureDate,
			lpaStatementDueDate: futureDate
		},
		documentationSummary: {
			ipComments: {
				status: DOCUMENT_STATUS_NOT_RECEIVED,
				counts: {
					awaiting_review: 0,
					valid: 0,
					published: 0
				}
			},
			lpaStatement: {
				status: DOCUMENT_STATUS_RECEIVED,
				representationStatus: APPEAL_REPRESENTATION_STATUS.VALID
			}
		}
	},
	awaitingLpaQuestionnaire: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
		documentationSummary: {
			lpaQuestionnaire: {
				dueDate: futureDate,
				status: DOCUMENT_STATUS_NOT_RECEIVED
			}
		}
	},
	awaitingLpaStatement: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.STATEMENTS,
		appealTimetable: {
			ipCommentsDueDate: pastDate,
			lpaStatementDueDate: futureDate
		},
		documentationSummary: {
			ipComments: {
				status: DOCUMENT_STATUS_RECEIVED,
				counts: {
					awaiting_review: 0,
					valid: 1,
					published: 0
				}
			},
			lpaStatement: {
				status: DOCUMENT_STATUS_NOT_RECEIVED,
				representationStatus: null
			}
		}
	},
	awaitingLpaUpdate: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
		documentationSummary: {
			lpaQuestionnaire: {
				dueDate: futureDate,
				status: VALIDATION_OUTCOME_INCOMPLETE
			}
		}
	},
	issueDecision: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.ISSUE_DETERMINATION
	},
	lpaQuestionnaireOverdue: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
		documentationSummary: {
			lpaQuestionnaire: {
				dueDate: pastDate,
				status: DOCUMENT_STATUS_NOT_RECEIVED
			}
		}
	},
	progressFromFinalComments: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.FINAL_COMMENTS,
		appealTimetable: {
			finalCommentsDueDate: pastDate
		},
		documentationSummary: {
			appellantFinalComments: {
				status: DOCUMENT_STATUS_NOT_RECEIVED
			},
			lpaFinalComments: {
				status: DOCUMENT_STATUS_NOT_RECEIVED
			}
		}
	},
	progressFromStatements: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.STATEMENTS,
		appealTimetable: {
			ipCommentsDueDate: pastDate,
			lpaStatementDueDate: pastDate
		},
		documentationSummary: {
			ipComments: {
				status: DOCUMENT_STATUS_NOT_RECEIVED,
				counts: {
					awaiting_review: 0,
					valid: 0,
					published: 0
				}
			},
			lpaStatement: {
				status: DOCUMENT_STATUS_NOT_RECEIVED,
				representationStatus: null
			}
		}
	},
	reviewAppellantCase: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.VALIDATION,
		documentationSummary: {
			appellantCase: {
				dueDate: futureDate,
				status: DOCUMENT_STATUS_RECEIVED
			}
		}
	},
	reviewAppellantFinalComments: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.FINAL_COMMENTS,
		appealTimetable: {
			finalCommentsDueDate: futureDate
		},
		documentationSummary: {
			appellantFinalComments: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			}
		}
	},
	reviewLpaFinalComments: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.FINAL_COMMENTS,
		appealTimetable: {
			finalCommentsDueDate: futureDate
		},
		documentationSummary: {
			lpaFinalComments: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			}
		}
	},
	reviewIpComments: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.STATEMENTS,
		appealTimetable: {
			ipCommentsDueDate: futureDate
		},
		documentationSummary: {
			ipComments: {
				status: DOCUMENT_STATUS_RECEIVED,
				counts: {
					awaiting_review: 1,
					valid: 0,
					published: 0
				}
			},
			lpaStatement: {
				status: DOCUMENT_STATUS_RECEIVED,
				representationStatus: APPEAL_REPRESENTATION_STATUS.VALID
			}
		}
	},
	reviewLpaQuestionnaire: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
		documentationSummary: {
			lpaQuestionnaire: {
				status: DOCUMENT_STATUS_RECEIVED
			}
		}
	},
	reviewLpaStatement: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.STATEMENTS,
		documentationSummary: {
			lpaStatement: {
				status: DOCUMENT_STATUS_RECEIVED,
				representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			}
		}
	},
	shareFinalComments: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.FINAL_COMMENTS,
		appealTimetable: {
			finalCommentsDueDate: pastDate
		},
		documentationSummary: {
			appellantFinalComments: {
				status: DOCUMENT_STATUS_RECEIVED,
				representationStatus: APPEAL_REPRESENTATION_STATUS.VALID
			},
			lpaFinalComments: {
				status: DOCUMENT_STATUS_NOT_RECEIVED
			}
		}
	},
	shareIpCommentsAndLpaStatement: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.STATEMENTS,
		appealTimetable: {
			ipCommentsDueDate: pastDate,
			lpaStatementDueDate: pastDate
		},
		documentationSummary: {
			ipComments: {
				status: DOCUMENT_STATUS_RECEIVED,
				counts: {
					awaiting_review: 0,
					valid: 1,
					published: 0
				}
			},
			lpaStatement: {
				status: DOCUMENT_STATUS_NOT_RECEIVED,
				representationStatus: null
			}
		}
	},
	setupHearing: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.EVENT,
		procedureType: APPEAL_CASE_PROCEDURE.HEARING
	},
	startAppeal: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.READY_TO_START
	},
	updateLpaStatement: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.STATEMENTS,
		appealTimetable: {
			ipCommentsDueDate: pastDate,
			lpaStatementDueDate: futureDate
		},
		documentationSummary: {
			ipComments: {
				status: DOCUMENT_STATUS_NOT_RECEIVED,
				counts: {
					awaiting_review: 0,
					valid: 0,
					published: 0
				}
			},
			lpaStatement: {
				status: DOCUMENT_STATUS_RECEIVED,
				representationStatus: APPEAL_REPRESENTATION_STATUS.INCOMPLETE
			}
		}
	},
	awaitingLinkedAppeal: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
		appealType: 'Planning appeal',
		awaitingLinkedAppeal: true
	},
	addResidencesNetChangeS78: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.COMPLETE,
		completedStateList: ['lpa_questionnaire'],
		appealType: 'Planning appeal',
		numberOfResidencesNetChange: null
	},
	addResidencesNetChangeS20: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.COMPLETE,
		completedStateList: ['lpa_questionnaire'],
		appealType: 'Planning listed building and conservation area appeal',
		numberOfResidencesNetChange: null
	},
	reviewLpaProofOfEvidenceComplete: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.EVIDENCE,
		documentationSummary: {
			lpaProofOfEvidence: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			},
			appellantProofOfEvidence: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.VALID
			}
		}
	},
	reviewAppellantProofOfEvidenceComplete: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.EVIDENCE,
		documentationSummary: {
			lpaProofOfEvidence: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.VALID
			},
			appellantProofOfEvidence: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			}
		}
	},
	reviewLpaProofOfEvidenceIncomplete: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.EVIDENCE,
		documentationSummary: {
			lpaProofOfEvidence: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			},
			appellantProofOfEvidence: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.INCOMPLETE
			}
		}
	},
	reviewAppellantProofOfEvidenceIncomplete: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.EVIDENCE,
		documentationSummary: {
			lpaProofOfEvidence: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.INCOMPLETE
			},
			appellantProofOfEvidence: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			}
		}
	},
	awaitingProofOfEvidenceAndWitnesses: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.EVIDENCE,
		appealTimetable: {
			appealTimetableId: 1053,
			proofOfEvidenceAndWitnessesDueDate: futureDate
		},
		documentationSummary: {
			lpaProofOfEvidence: {
				status: DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.INCOMPLETE
			},
			appellantProofOfEvidence: {
				status: DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			}
		}
	},
	awaitingLpaProofOfEvidenceAndWitnesses: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.EVIDENCE,
		appealTimetable: {
			appealTimetableId: 1053,
			proofOfEvidenceAndWitnessesDueDate: futureDate
		},
		documentationSummary: {
			lpaProofOfEvidence: {
				status: DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: null,
				representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			},
			appellantProofOfEvidence: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.INCOMPLETE
			}
		}
	},
	awaitingAppellantProofOfEvidenceAndWitnesses: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.EVIDENCE,
		appealTimetable: {
			appealTimetableId: 1053,
			proofOfEvidenceAndWitnessesDueDate: futureDate
		},
		documentationSummary: {
			lpaProofOfEvidence: {
				status: DOCUMENT_STATUS_RECEIVED,
				receivedAt: pastDate,
				representationStatus: APPEAL_REPRESENTATION_STATUS.INCOMPLETE
			},
			appellantProofOfEvidence: {
				status: DOCUMENT_STATUS_NOT_RECEIVED,
				receivedAt: null,
				representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			}
		}
	},
	progressToProofOfEvidenceAndWitnessesComplete: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.STATEMENTS,
		procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
		documentationSummary: {
			ipComments: {
				status: DOCUMENT_STATUS_RECEIVED,
				counts: {
					awaiting_review: 0,
					valid: 0,
					published: 0
				}
			},
			lpaStatement: {
				status: DOCUMENT_STATUS_RECEIVED,
				counts: {
					awaiting_review: 0,
					valid: 0,
					published: 0
				}
			}
		}
	},
	progressToInquiry: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.EVIDENCE,
		procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
		appealTimetable: {
			appealTimetableId: 1053,
			proofOfEvidenceAndWitnessesDueDate: pastDate
		},
		documentationSummary: {
			ipComments: {
				status: DOCUMENT_STATUS_RECEIVED,
				counts: {
					awaiting_review: 0,
					valid: 0,
					published: 0
				}
			},
			lpaStatement: {
				status: DOCUMENT_STATUS_RECEIVED,
				counts: {
					awaiting_review: 0,
					valid: 0,
					published: 0
				}
			}
		}
	},
	addInquiryAddress: {
		...baseAppealDataToGetRequiredActions,
		inquiry: {
			addressId: null,
			address: null
		},
		isInquirySetup: true,
		hasInquiryAddress: false,
		appealStatus: APPEAL_CASE_STATUS.EVENT,
		procedureType: APPEAL_CASE_PROCEDURE.INQUIRY
	},
	setupInquiry: {
		...baseAppealDataToGetRequiredActions,
		inquiry: null,
		appealStatus: APPEAL_CASE_STATUS.EVENT,
		procedureType: APPEAL_CASE_PROCEDURE.INQUIRY
	},
	awaitingEvent: {
		...baseAppealDataToGetRequiredActions,
		appealStatus: APPEAL_CASE_STATUS.AWAITING_EVENT,
		procedureType: APPEAL_CASE_PROCEDURE.INQUIRY
	}
};

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

export const caseNotes = [
	{
		createdAt: '2024-10-01T10:00:00.000Z',
		comment: 'A case note you should see.',
		azureAdUserId: '923ac03b-9031-4cf4-8b17-348c274321f9'
	},
	{
		createdAt: '2024-10-01T10:00:00.000Z',
		comment: 'A case note you should see.',
		azureAdUserId: '923ac03b-9031-4cf4-8b17-348c274321f9'
	}
];

export const text300Characters =
	'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cill';

export const text301Characters = text300Characters + 'u';

export const lpaDesignatedSites = [
	{
		id: 1,
		key: 'SSSI',
		name: 'SSSI (site of special scientific interest)'
	},
	{
		id: 2,
		key: 'cSAC',
		name: 'cSAC (candidate special area of conservation)'
	},
	{
		id: 3,
		key: 'SAC',
		name: 'SAC (special area of conservation)'
	},
	{
		id: 4,
		key: 'pSPA',
		name: 'pSPA (potential special protection area)'
	},
	{
		id: 5,
		key: 'SPA',
		name: 'SPA Ramsar (Ramsar special protection area)'
	}
];

export const designatedSiteNames = [
	{
		id: 1,
		key: 'SSSI',
		name: 'SSSI (site of special scientific interest)'
	},
	{
		id: 0,
		key: 'custom',
		name: 'test custom designation'
	}
];

export const caseAuditLog = [
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details:
			"Thise case has over 300 characters in the details field. This is a test to ensure that the system can handle long text entries without issues. Case progressed to awaiting_lpa_questionnaire. There should be over 300 character in this field to test the system's ability to handle long text entries without truncation or errors. - it should show the show more compoonent",
		loggedDate: '2025-05-27T09:55:30.175Z'
	},
	{
		azureAdUserId: '00000000-0000-0000-0000-000000000000',
		details: 'Case progressed to issue_determination',
		loggedDate: '2025-05-27T09:55:36.910Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'Case progressed to awaiting_event',
		loggedDate: '2025-05-27T09:55:30.175Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'The site visit was arranged for Thursday 2 October',
		loggedDate: '2025-05-27T09:55:30.106Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'Final comments shared',
		loggedDate: '2025-05-27T09:55:22.784Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'Case progressed to event',
		loggedDate: '2025-05-27T09:55:22.781Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'LPA final comments accepted',
		loggedDate: '2025-05-27T09:55:09.783Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'Appellant final comments accepted',
		loggedDate: '2025-05-27T09:55:05.167Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'Statements and IP comments shared',
		loggedDate: '2025-05-27T09:54:59.262Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'Case progressed to final_comments',
		loggedDate: '2025-05-27T09:54:59.237Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'LPA questionnaire updated',
		loggedDate: '2025-05-27T09:52:39.322Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'Case progressed to statements',
		loggedDate: '2025-05-27T09:52:39.253Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'Case progressed to lpa_questionnaire',
		loggedDate: '2025-05-27T09:52:30.000Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'The case timeline was created',
		loggedDate: '2025-05-27T09:52:29.903Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'Case updated',
		loggedDate: '2025-05-27T09:52:23.680Z'
	},
	{
		azureAdUserId: activeDirectoryUsersData[0].id,
		details: 'Case progressed to ready_to_start',
		loggedDate: '2025-05-27T09:52:23.597Z'
	}
];

export const caseNotificationAuditLog = [
	{
		recipient: 'test2@example.com',
		subject: 'We have corrected the appeal decision letter: 6000071',
		renderedContent:
			'<div class="pins-notify-preview-border"> We have corrected the appeal decision letter.<br>\n\n<h2>Appeal details</h2>\n\n<div class="govuk-inset-text">\nAppeal reference number: 6000071 \nAddress: 44 Rivervale, Bridport, DT6 5RN\nPlanning application reference: 40845/APP/2/563702\n</div>\n<h2>Why we corrected the appeal decision letter</h2>\n\nadsfgbhgjhftrewq3wrtghyfgdscvfhgerdfv fbgdtrfv bvnhgftrfesdcvfcb gdrfvb bnvhgfgtv<br>\n\n<a href="http://localhost:9003/manage-appeals/6000071" class="govuk-link">Sign in to our service</a> to view the decision letter dated .<br>\n\n<h2>The Planning Inspectorate’s role</h2>\n\nThe Planning Inspectorate cannot change or revoke the decision. Only the High Court can change this decision.<br>\n\n<h2>Feedback</h2>\n\nWe welcome your feedback on our appeals service. Tell us on this short <a href="https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u" class="govuk-link">feedback form</a>.<br>\n\nThe Planning Inspectorate<br>\ncaseofficers@planninginspectorate.gov.uk<br> </div>',
		renderedSubject:
			'<div class="pins-notify-preview-border"> Subject: We have corrected the appeal decision letter: 6000071<br> </div>',
		dateCreated: '2025-07-15T13:48:10.631Z',
		sender: '923ac03b-9031-4cf4-8b17-348c274321f9'
	},
	{
		recipient: 'George.McTest@planninginspectorate.gov.uk',
		subject: 'We have corrected the appeal decision letter: 6000071',
		renderedContent:
			'<div class="pins-notify-preview-border"> We have corrected the appeal decision letter.<br>\n\n<h2>Appeal details</h2>\n\n<div class="govuk-inset-text">\nAppeal reference number: 6000071 \nAddress: 44 Rivervale, Bridport, DT6 5RN\nPlanning application reference: 40845/APP/2/563702\n</div>\n<h2>Why we corrected the appeal decision letter</h2>\n\nadsfgbhgjhftrewq3wrtghyfgdscvfhgerdfv fbgdtrfv bvnhgftrfesdcvfcb gdrfvb bnvhgfgtv<br>\n\n<a href="http://localhost:9003/manage-appeals/6000071" class="govuk-link">Sign in to our service</a> to view the decision letter dated .<br>\n\n<h2>The Planning Inspectorate’s role</h2>\n\nThe Planning Inspectorate cannot change or revoke the decision. Only the High Court can change this decision.<br>\n\n<h2>Feedback</h2>\n\nWe welcome your feedback on our appeals service. Tell us on this short <a href="https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u" class="govuk-link">feedback form</a>.<br>\n\nThe Planning Inspectorate<br>\ncaseofficers@planninginspectorate.gov.uk<br> </div>',
		renderedSubject:
			'<div class="pins-notify-preview-border"> Subject: We have corrected the appeal decision letter: 6000071<br> </div>',
		dateCreated: '2025-07-15T13:48:10.631Z',
		sender: '923ac03b-9031-4cf4-8b17-348c274321f9'
	},
	{
		recipient: 'John.Smith@planninginspectorate.gov.uk',
		subject: 'We have corrected the appeal decision letter: 6000071',
		renderedContent:
			'<div class="pins-notify-preview-border"> We have corrected the appeal decision letter.<br>\n\n<h2>Appeal details</h2>\n\n<div class="govuk-inset-text">\nAppeal reference number: 6000071 \nAddress: 44 Rivervale, Bridport, DT6 5RN\nPlanning application reference: 40845/APP/2/563702\n</div>\n<h2>Why we corrected the appeal decision letter</h2>\n\nadsfgbhgjhftrewq3wrtghyfgdscvfhgerdfv fbgdtrfv bvnhgftrfesdcvfcb gdrfvb bnvhgfgtv<br>\n\n<a href="http://localhost:9003/manage-appeals/6000071" class="govuk-link">Sign in to our service</a> to view the decision letter dated .<br>\n\n<h2>The Planning Inspectorate’s role</h2>\n\nThe Planning Inspectorate cannot change or revoke the decision. Only the High Court can change this decision.<br>\n\n<h2>Feedback</h2>\n\nWe welcome your feedback on our appeals service. Tell us on this short <a href="https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u" class="govuk-link">feedback form</a>.<br>\n\nThe Planning Inspectorate<br>\ncaseofficers@planninginspectorate.gov.uk<br> </div>',
		renderedSubject:
			'<div class="pins-notify-preview-border"> Subject: We have corrected the appeal decision letter: 6000071<br> </div>',
		dateCreated: '2025-07-15T13:48:10.631Z',
		sender: '923ac03b-9031-4cf4-8b17-348c274321f9'
	},
	{
		recipient: 'test3@example.com',
		subject: 'Appeal decision: 6000071',
		renderedContent:
			'<div class="pins-notify-preview-border"> <h2>Appeal details</h2>\n\n<div class="govuk-inset-text">\nAppeal reference number: 6000071 \nAddress: 44 Rivervale, Bridport, DT6 5RN\nPlanning application reference: 40845/APP/2/563702\n</div>\n<h2>Appeal decision</h2>\n\nA decision has been made on this appeal.<br>\n\n<a href="http://localhost:9003/manage-appeals/6000071" class="govuk-link">Sign in to our service</a> to view the decision letter dated 15 July 2025.<br>\n\nThe appellant has been informed of the decision.<br>\n\n<h2>The Planning Inspectorate’s role</h2>\n\nThe Planning Inspectorate cannot change or revoke the decision. Only the High Court can change this decision.<br>\n\n<h2>Feedback</h2>\n\nWe welcome your feedback on our appeals service. Tell us on this short <a href="https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u" class="govuk-link">feedback form</a>.<br>\n\nThe Planning Inspectorate<br>\nallcustomerteam@planninginspectorate.gov.uk<br> </div>',
		renderedSubject:
			'Subject: <div class="pins-notify-preview-border"> Appeal decision: 6000071<br> </div>',
		dateCreated: '2025-07-15T13:45:23.980Z',
		sender: '923ac03b-9031-4cf4-8b17-348c274321f9'
	},
	{
		recipient: 'wilt@lpa-email.gov.uk',
		subject: 'Appeal decision: 6000071',
		renderedContent:
			'<div class="pins-notify-preview-border"> <h2>Appeal details</h2>\n\n<div class="govuk-inset-text">\nAppeal reference number: 6000071 \nAddress: 44 Rivervale, Bridport, DT6 5RN\nPlanning application reference: 40845/APP/2/563702\n</div>\n<h2>Appeal decision</h2>\n\nWe have made a decision on your appeal.<br>\n\n<a href="http://localhost:9003/appeals/6000071" class="govuk-link">Sign in to our service</a> to view the decision letter dated 15 July 2025.<br>\n\nWe have also informed the local planning authority of the decision.<br>\n\n<h2>The Planning Inspectorate’s role</h2>\n\nThe Planning Inspectorate cannot change or revoke the decision. You can <a href="https://www.gov.uk/appeal-planning-decision/if-you-think-the-appeal-decision-is-legally-incorrect" class="govuk-link">challenge the decision in the High Court</a> if you think the Planning Inspectorate made a legal mistake.<br>\n\n<h2>Feedback</h2>\n\nWe welcome your feedback on our appeals service. Tell us on this short <a href="https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u" class="govuk-link">feedback form</a>.<br>\n\nThe Planning Inspectorate<br>\n<a href="https://contact-us.planninginspectorate.gov.uk/hc/en-gb/requests/new" class="govuk-link">Get help with your appeal decision</a><br> </div>',
		renderedSubject:
			'Subject: <div class="pins-notify-preview-border"> Appeal decision: 6000071<br> </div>',
		dateCreated: '2025-07-15T13:45:23.977Z',
		sender: '923ac03b-9031-4cf4-8b17-348c274321f9'
	},
	{
		recipient: 'test1@email.com',
		subject: 'Inspector visit to appeal site: 6000071',
		renderedContent:
			'<div class="pins-notify-preview-border"> <h2>Appeal details</h2>\n\n<div class="govuk-inset-text">\nAppeal reference number: 6000071 \nAddress: 44 Rivervale, Bridport, DT6 5RN\nPlanning application reference: 40845/APP/2/563702\n</div>\n<h2>Site visit scheduled</h2>\n\nWe have now arranged for our inspector (or their representative) to visit 44 Rivervale, Bridport, DT6 5RN.<br>\n\nYou are not required to attend the site visit.<br>\n\n<h2>About the visit</h2>\n\nIf you see the inspector, be aware that you cannot give them any documents or discuss the appeal with them.<br>\n\nThe inspector will carry out the inspection on their own.<br>\n\n<h2>Next steps</h2>\n\nWe will let you know our inspector’s decision when it is available.<br>\n\nIf you need to contact us, include our reference number in any communication.<br>\n\nThe Planning Inspectorate<br>\ncaseofficers@planninginspectorate.gov.uk<br> </div>',
		renderedSubject:
			'Subject: <div class="pins-notify-preview-border"> Inspector visit to appeal site: 6000071<br> </div>',
		dateCreated: '2025-07-15T13:45:00.006Z',
		sender: '923ac03b-9031-4cf4-8b17-348c274321f9'
	},
	{
		recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk',
		subject: 'We have received the appellant’s final comments: 6000071',
		renderedContent:
			'<div class="pins-notify-preview-border"> We have received the appellant’s final comments.<br>\n\n<h2>Appeal details</h2>\n\n<div class="govuk-inset-text">\nAppeal reference number: 6000071 \nAddress: 44 Rivervale, Bridport, DT6 5RN\nPlanning application reference: 40845/APP/2/563702\n</div>\n<h2>What happens next</h2>\n\nYou can <a href="http://localhost:9003/manage-appeals/6000071" class="govuk-link">view the appellant’s final comments</a>.<br>\n\nThe inspector will visit the site and we will contact you when we have made the decision.<br>\n\nThe Planning Inspectorate<br>\ncaseofficers@planninginspectorate.gov.uk<br> </div>',
		renderedSubject:
			'Subject: <div class="pins-notify-preview-border"> We have received the appellant’s final comments: 6000071<br> </div>',
		dateCreated: '2025-07-15T13:44:50.254Z',
		sender: '923ac03b-9031-4cf4-8b17-348c274321f9'
	}
];

export const template = {
	renderedHtml: [
		`<div class="pins-notify-preview-border">`,
		`We have corrected the appeal decision letter.<br><br>`,
		`<h2>Appeal details</h2>`,
		`<div class="govuk-inset-text">`,
		`  Appeal reference number: 12345 <br>`,
		`  Address: 2222<br>`,
		`  Planning application reference: planningApplicationReference<br>`,
		`</div>`,
		`<h2>Why we corrected the appeal decision letter</h2>`,
		`correctionNotice<br><br>`,
		`<a href="https://appeals-service-test.planninginspectorate.gov.uk/manage-appeals/12345" class="govuk-link">Sign in to our service</a> to view the decision letter dated dateISOStringToDisplayDate(file.receivedDate).<br><br>`,
		`<h2>The Planning Inspectorate's role</h2>`,
		`The Planning Inspectorate cannot change or revoke the decision. Only the High Court can change this decision.<br><br>`,
		`<h2>Feedback</h2>`,
		`We welcome your feedback on our appeals service. Tell us on this short <a href="https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u" class="govuk-link">feedback form</a>.<br><br>`,
		`The Planning Inspectorate<br><br>`,
		`caseofficers@planninginspectorate.gov.uk<br><br>`,
		`</div>`
	].join('\n')
};

export const caseTeams = [
	{
		id: 1,
		email: 'temp@email.com',
		name: 'temp'
	},
	{
		id: 2,
		email: 'temp2@email.com',
		name: 'temp2'
	},
	{
		id: 3,
		email: 'temp3@email.com',
		name: 'temp3'
	},
	{
		id: 4,
		email: null,
		name: 'temp4'
	}
];
