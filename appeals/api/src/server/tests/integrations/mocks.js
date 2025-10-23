import { FOLDERS } from '@pins/appeals/constants/documents.js';

export const validAppellantCase = {
	casedata: {
		submissionId: '14960baa-3d0f-4db9-9e84-0c75be891560',
		advertisedAppeal: true,
		appellantCostsAppliedFor: false,
		applicationDate: '2024-01-01T00:00:00.000Z',
		applicationDecision: 'refused',
		applicationDecisionDate: '2024-01-01T00:00:00.000Z',
		applicationReference: '123',
		caseProcedure: 'written',
		caseSubmissionDueDate: '2024-03-25T23:59:59.999Z',
		caseSubmittedDate: '2024-03-25T23:59:59.999Z',
		caseType: 'D',
		changedDevelopmentDescription: false,
		enforcementNotice: false,
		floorSpaceSquareMetres: 22,
		knowsAllOwners: 'Some',
		knowsOtherOwners: 'Some',
		lpaCode: 'Q9999',
		isGreenBelt: false,
		nearbyCaseReferences: ['1000000'],
		neighbouringSiteAddresses: [],
		originalDevelopmentDescription: 'A test description',
		ownersInformed: true,
		ownsAllLand: true,
		ownsSomeLand: true,
		siteAccessDetails: ['Come and see'],
		siteAddressCounty: 'Somewhere',
		siteAddressLine1: 'Somewhere',
		siteAddressLine2: 'Somewhere St',
		siteAddressPostcode: 'SOM3 W3R',
		siteAddressTown: 'Somewhereville',
		siteAreaSquareMetres: 22,
		siteSafetyDetails: ["It's dangerous"]
	},
	documents: [
		{
			dateCreated: '2024-03-01T13:48:35.847Z',
			documentId: '001',
			documentType: 'appellantCostsApplication',
			documentURI:
				'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
			filename: 'img1.jpg',
			mime: 'image/jpeg',
			originalFilename: 'oimg.jpg',
			size: 10293
		}
	],
	users: [
		{
			emailAddress: 'test@test.com',
			firstName: 'Testy',
			lastName: 'McTest',
			salutation: 'Mr',
			serviceUserType: 'Appellant',
			organisation: 'A company',
			telephoneNumber: '0123456789'
		}
	]
};

export const validAppellantCaseCASAdverts = {
	casedata: {
		submissionId: '14960baa-3d0f-4db9-9e84-0c75be891560',
		advertisedAppeal: true,
		appellantCostsAppliedFor: false,
		applicationDate: '2024-01-01T00:00:00.000Z',
		applicationDecision: 'refused',
		applicationDecisionDate: '2024-01-01T00:00:00.000Z',
		applicationReference: '123',
		caseProcedure: 'written',
		caseSubmissionDueDate: '2024-03-25T23:59:59.999Z',
		caseSubmittedDate: '2024-03-25T23:59:59.999Z',
		caseType: 'ZA',
		changedDevelopmentDescription: false,
		enforcementNotice: false,
		floorSpaceSquareMetres: 22,
		knowsAllOwners: 'Some',
		knowsOtherOwners: 'Some',
		lpaCode: 'Q9999',
		isGreenBelt: false,
		nearbyCaseReferences: ['1000000'],
		neighbouringSiteAddresses: [],
		originalDevelopmentDescription: 'A test description',
		ownersInformed: true,
		ownsAllLand: true,
		ownsSomeLand: true,
		siteAccessDetails: ['Come and see'],
		siteAreaSquareMetres: 22,
		siteSafetyDetails: ["It's dangerous"],
		isAdvertInPosition: true,
		isSiteOnHighwayLand: true,
		hasLandownersPermission: true,
		siteGridReferenceEasting: '012345',
		siteGridReferenceNorthing: '678910'
	},
	documents: [
		{
			dateCreated: '2024-03-01T13:48:35.847Z',
			documentId: '001',
			documentType: 'appellantCostsApplication',
			documentURI:
				'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
			filename: 'img1.jpg',
			mime: 'image/jpeg',
			originalFilename: 'oimg.jpg',
			size: 10293
		}
	],
	users: [
		{
			emailAddress: 'test@test.com',
			firstName: 'Testy',
			lastName: 'McTest',
			salutation: 'Mr',
			serviceUserType: 'Appellant',
			organisation: 'A company',
			telephoneNumber: '0123456789'
		}
	]
};

export const validAppellantCaseCASPlanning = {
	...validAppellantCase,
	casedata: {
		...validAppellantCase.casedata,
		caseType: 'ZP'
	}
};

export const validAppellantCaseS78 = {
	...validAppellantCase,
	casedata: {
		...validAppellantCase.casedata,
		caseType: 'W',
		appellantProcedurePreference: 'inquiry',
		appellantProcedurePreferenceDetails: 'Reason for preference',
		appellantProcedurePreferenceDuration: 3,
		appellantProcedurePreferenceWitnessCount: 2,
		agriculturalHolding: false,
		tenantAgriculturalHolding: null,
		otherTenantsAgriculturalHolding: null,
		informedTenantsAgriculturalHolding: null,
		planningObligation: false,
		statusPlanningObligation: null,
		developmentType: 'minor-dwellings'
	}
};

export const validAppellantCaseS20 = {
	...validAppellantCase,
	casedata: {
		...validAppellantCase.casedata,
		caseType: 'Y',
		appellantProcedurePreference: 'inquiry',
		appellantProcedurePreferenceDetails: 'Reason for preference',
		appellantProcedurePreferenceDuration: 3,
		appellantProcedurePreferenceWitnessCount: 2,
		planningObligation: false,
		agriculturalHolding: null,
		tenantAgriculturalHolding: null,
		otherTenantsAgriculturalHolding: null,
		informedTenantsAgriculturalHolding: null,
		statusPlanningObligation: null,
		developmentType: 'minor-dwellings'
	}
};

const validLpaQuestionnaireCommon = {
	casedata: {
		caseReference: '6000000',
		nearbyCaseReferences: ['1000000'],
		lpaQuestionnaireSubmittedDate: new Date(2024, 5, 1).toISOString(),
		siteAccessDetails: ['Here it is'],
		siteSafetyDetails: ['Fine'],
		neighbouringSiteAddresses: [
			{
				neighbouringSiteAddressLine1: 'deserunt in irure do',
				neighbouringSiteAddressLine2: null,
				neighbouringSiteAddressTown: 'laboris ut enim et laborum',
				neighbouringSiteAddressCounty: 'reprehenderit eu mollit Excepteur sit',
				neighbouringSiteAddressPostcode: 'aliqua in qui ipsum',
				neighbouringSiteAccessDetails: null,
				neighbouringSiteSafetyDetails: 'magna proident incididunt in non'
			}
		],
		reasonForNeighbourVisits: undefined
	},
	documents: [
		{
			dateCreated: '2024-03-01T13:48:35.847Z',
			documentId: '001',
			documentType: 'lpaCostsWithdrawal',
			documentURI:
				'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
			filename: 'img2.jpg',
			mime: 'image/jpeg',
			originalFilename: 'oimg.jpg',
			size: 10293
		},
		{
			dateCreated: '2024-03-01T13:48:35.847Z',
			documentId: '001',
			documentType: 'lpaCostsApplication',
			documentURI:
				'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
			filename: 'img3.jpg',
			mime: 'image/jpeg',
			originalFilename: 'oimg.jpg',
			size: 10293
		}
	]
};

export const validLpaQuestionnaireHas = {
	casedata: {
		...validLpaQuestionnaireCommon.casedata,
		caseType: 'D',
		lpaStatement: 'cupidatat ipsum eu culpa',
		isCorrectAppealType: true,
		isGreenBelt: false,
		inConservationArea: true,
		newConditionDetails: 'cupidatat',
		notificationMethod: ['notice', 'letter'],
		affectedListedBuildingNumbers: ['10001', '10002'],
		lpaCostsAppliedFor: false
	},
	documents: validLpaQuestionnaireCommon.documents
};

export const validLpaQuestionnaireCASPlanning = {
	casedata: {
		...validLpaQuestionnaireHas.casedata,
		caseType: 'ZP'
	},
	documents: validLpaQuestionnaireCommon.documents
};

export const validLpaQuestionnaireS78 = {
	casedata: {
		...validLpaQuestionnaireCommon.casedata,
		...validLpaQuestionnaireHas.casedata,
		caseType: 'W',
		changedListedBuildingNumbers: ['10023', '17824'],
		designatedSitesNames: ['SSSI'],
		affectsScheduledMonument: true,
		isAonbNationalLandscape: true,
		isGypsyOrTravellerSite: true,
		isPublicRightOfWay: true,
		eiaEnvironmentalImpactSchedule: 'schedule-1',
		eiaDevelopmentDescription: 'change-extensions',
		eiaSensitiveAreaDetails: '',
		eiaColumnTwoThreshold: true,
		eiaScreeningOpinion: true,
		eiaRequiresEnvironmentalStatement: true,
		eiaCompletedEnvironmentalStatement: true,
		consultedBodiesDetails: '',
		hasProtectedSpecies: true,
		hasStatutoryConsultees: true,
		hasInfrastructureLevy: true,
		hasTreePreservationOrder: true,
		hasConsultationResponses: true,
		hasEmergingPlan: true,
		hasSupplementaryPlanningDocs: true,
		isInfrastructureLevyFormallyAdopted: true,
		infrastructureLevyAdoptedDate: '2023-07-27T20:30:00.000Z',
		infrastructureLevyExpectedDate: '2023-07-27T20:30:00.000Z',
		lpaProcedurePreference: 'written',
		lpaProcedurePreferenceDetails: '',
		lpaProcedurePreferenceDuration: 1,
		lpaFinalCommentDetails: '',
		lpaAddedWitnesses: true,
		siteWithinSSSI: true,
		reasonForNeighbourVisits: undefined,
		importantInformation: '',
		redeterminedIndicator: '',
		dateCostsReportDespatched: '2023-07-27T20:30:00.000Z',
		dateNotRecoveredOrDerecovered: '2023-07-27T20:30:00.000Z',
		dateRecovered: '2023-07-27T20:30:00.000Z',
		originalCaseDecisionDate: '2023-07-27T20:30:00.000Z',
		targetDate: '2023-07-27T20:30:00.000Z',
		siteNoticesSentDate: '2023-07-27T20:30:00.000Z',
		designatedSiteNameCustom: ''
	},
	documents: [
		{
			dateCreated: '2024-03-01T13:48:35.847Z',
			documentId: '001',
			documentType: 'lpaCostsWithdrawal',
			documentURI:
				'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
			filename: 'img2.jpg',
			mime: 'image/jpeg',
			originalFilename: 'oimg.jpg',
			size: 10293
		},
		{
			dateCreated: '2024-03-01T13:48:35.847Z',
			documentId: '001',
			documentType: 'lpaCostsApplication',
			documentURI:
				'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
			filename: 'img3.jpg',
			mime: 'image/jpeg',
			originalFilename: 'oimg.jpg',
			size: 10293
		}
	]
};

export const validLpaQuestionnaireS20 = {
	casedata: {
		...validLpaQuestionnaireS78.casedata,
		caseType: 'Y',
		preserveGrantLoan: true
	},
	documents: validLpaQuestionnaireS78.documents
};

export const validRepresentationIp = {
	caseReference: '6004741',
	representation: 'Hello, not about cheese but still a rep of some kind (IP comment)',
	representationType: 'comment',
	representationSubmittedDate: '2025-01-22T13:48:35.847Z',
	newUser: {
		emailAddress: 'test@test.com',
		firstName: 'Testy',
		lastName: 'McTest',
		salutation: 'Mr',
		serviceUserType: 'InterestedParty',
		organisation: 'A company',
		telephoneNumber: '0123456789'
	},
	documents: [
		{
			dateCreated: '2024-03-01T13:48:35.847Z',
			documentId: '001',
			documentType: 'interestedPartyComment',
			documentURI:
				'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
			filename: 'img3.jpg',
			mime: 'image/jpeg',
			originalFilename: 'oimg.jpg',
			size: 10293
		}
	]
};

export const validRepresentationLpaStatement = {
	caseReference: '6004741',
	representation: 'Hello, not about cheese but still a rep of some kind (LPA statement)',
	representationType: 'statement',
	representationSubmittedDate: '2025-01-22T13:48:35.847Z',
	lpaCode: 'Q9999',
	documents: [
		{
			dateCreated: '2024-03-01T13:48:35.847Z',
			documentId: '001',
			documentType: 'lpaStatement',
			documentURI:
				'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
			filename: 'img3.jpg',
			mime: 'image/jpeg',
			originalFilename: 'oimg.jpg',
			size: 10293
		}
	]
};

export const validRepresentationAppellantFinalComment = {
	caseReference: '6004741',
	representation: 'Hello, not about cheese but still a rep of some kind (Appellant final comment)',
	representationType: 'statement',
	representationSubmittedDate: '2025-01-22T13:48:35.847Z',
	serviceUserId: '1',
	documents: [
		{
			dateCreated: '2024-03-01T13:48:35.847Z',
			documentId: '001',
			documentType: 'appellantFinalComment',
			documentURI:
				'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
			filename: 'img3.jpg',
			mime: 'image/jpeg',
			originalFilename: 'oimg.jpg',
			size: 10293
		}
	]
};

export const appealIngestionInput = {
	appealType: {
		connect: {
			key: 'D'
		}
	},
	appellant: {
		create: {
			organisationName: 'A company',
			salutation: 'Mr',
			firstName: 'Testy',
			lastName: 'McTest',
			email: 'test@test.com',
			webAddress: undefined,
			phoneNumber: '0123456789',
			otherPhoneNumber: undefined,
			faxNumber: undefined
		}
	},
	agent: {
		create: undefined
	},
	lpa: {
		connect: {
			lpaCode: 'Q9999'
		}
	},
	applicationReference: '123',
	address: {
		create: {
			addressLine1: 'Somewhere',
			addressLine2: 'Somewhere St',
			addressCounty: 'Somewhere',
			postcode: 'SOM3 W3R',
			addressTown: 'Somewhereville'
		}
	},
	appellantCase: {
		create: {
			applicationDate: '2024-01-01T00:00:00.000Z',
			applicationDecision: 'refused',
			applicationDecisionDate: '2024-01-01T00:00:00.000Z',
			caseSubmittedDate: '2024-03-25T23:59:59.999Z',
			caseSubmissionDueDate: '2024-03-25T23:59:59.999Z',
			siteAccessDetails: 'Come and see',
			siteSafetyDetails: "It's dangerous",
			siteAreaSquareMetres: 22,
			floorSpaceSquareMetres: 22,
			ownsAllLand: true,
			ownsSomeLand: true,
			hasAdvertisedAppeal: true,
			appellantCostsAppliedFor: false,
			originalDevelopmentDescription: 'A test description',
			changedDevelopmentDescription: false,
			ownersInformed: true,
			knowsAllOwners: {
				connect: {
					key: 'Some'
				}
			},
			knowsOtherOwners: {
				connect: {
					key: 'Some'
				}
			},
			isGreenBelt: false
		}
	},
	neighbouringSites: {
		create: []
	},
	folders: {
		create: FOLDERS.map((/** @type {{ path: string; }} */ f) => {
			return { path: f };
		})
	}
};

export const appealIngestionInputCasAdverts = {
	appealType: {
		connect: {
			key: 'ZA'
		}
	},
	appellant: {
		create: {
			organisationName: 'A company',
			salutation: 'Mr',
			firstName: 'Testy',
			lastName: 'McTest',
			email: 'test@test.com',
			webAddress: undefined,
			phoneNumber: '0123456789',
			otherPhoneNumber: undefined,
			faxNumber: undefined
		}
	},
	agent: {
		create: undefined
	},
	lpa: {
		connect: {
			lpaCode: 'Q9999'
		}
	},
	applicationReference: '123',
	appellantCase: {
		create: {
			applicationDate: '2024-01-01T00:00:00.000Z',
			applicationDecision: 'refused',
			applicationDecisionDate: '2024-01-01T00:00:00.000Z',
			caseSubmittedDate: '2024-03-25T23:59:59.999Z',
			caseSubmissionDueDate: '2024-03-25T23:59:59.999Z',
			siteAccessDetails: 'Come and see',
			siteSafetyDetails: "It's dangerous",
			siteAreaSquareMetres: 22,
			floorSpaceSquareMetres: 22,
			ownsAllLand: true,
			ownsSomeLand: true,
			hasAdvertisedAppeal: true,
			appellantCostsAppliedFor: false,
			originalDevelopmentDescription: 'A test description',
			changedDevelopmentDescription: false,
			ownersInformed: true,
			siteGridReferenceEasting: '012345',
			siteGridReferenceNorthing: '678910',
			advertInPosition: true,
			highwayLand: true,
			landownerPermission: true,
			knowsAllOwners: {
				connect: {
					key: 'Some'
				}
			},
			knowsOtherOwners: {
				connect: {
					key: 'Some'
				}
			},
			isGreenBelt: false
		}
	},
	neighbouringSites: {
		create: []
	},
	folders: {
		create: FOLDERS.map((/** @type {{ path: string; }} */ f) => {
			return { path: f };
		})
	}
};

export const appealIngestionInputCasPlanning = {
	appealType: {
		connect: {
			key: 'ZP'
		}
	},
	appellant: {
		create: {
			organisationName: 'A company',
			salutation: 'Mr',
			firstName: 'Testy',
			lastName: 'McTest',
			email: 'test@test.com',
			webAddress: undefined,
			phoneNumber: '0123456789',
			otherPhoneNumber: undefined,
			faxNumber: undefined
		}
	},
	agent: {
		create: undefined
	},
	lpa: {
		connect: {
			lpaCode: 'Q9999'
		}
	},
	applicationReference: '123',
	address: {
		create: {
			addressLine1: 'Somewhere',
			addressLine2: 'Somewhere St',
			addressCounty: 'Somewhere',
			postcode: 'SOM3 W3R',
			addressTown: 'Somewhereville'
		}
	},
	appellantCase: {
		create: {
			applicationDate: '2024-01-01T00:00:00.000Z',
			applicationDecision: 'refused',
			applicationDecisionDate: '2024-01-01T00:00:00.000Z',
			caseSubmittedDate: '2024-03-25T23:59:59.999Z',
			caseSubmissionDueDate: '2024-03-25T23:59:59.999Z',
			siteAccessDetails: 'Come and see',
			siteSafetyDetails: "It's dangerous",
			siteAreaSquareMetres: 22,
			floorSpaceSquareMetres: 22,
			ownsAllLand: true,
			ownsSomeLand: true,
			hasAdvertisedAppeal: true,
			appellantCostsAppliedFor: false,
			originalDevelopmentDescription: 'A test description',
			changedDevelopmentDescription: false,
			ownersInformed: true,
			knowsAllOwners: {
				connect: {
					key: 'Some'
				}
			},
			knowsOtherOwners: {
				connect: {
					key: 'Some'
				}
			},
			isGreenBelt: false
		}
	},
	neighbouringSites: {
		create: []
	},
	folders: {
		create: FOLDERS.map((/** @type {{ path: string; }} */ f) => {
			return { path: f };
		})
	}
};

export const appealIngestionInputS78 = {
	...appealIngestionInput,
	appealType: {
		connect: {
			key: 'W'
		}
	},
	appellantCase: {
		create: {
			...appealIngestionInput.appellantCase.create,
			appellantProcedurePreference: 'inquiry',
			appellantProcedurePreferenceDetails: 'Reason for preference',
			appellantProcedurePreferenceDuration: 3,
			appellantProcedurePreferenceWitnessCount: 2,
			agriculturalHolding: false,
			caseworkReason: undefined,
			developmentType: 'minor-dwellings',
			informedTenantsAgriculturalHolding: null,
			planningObligation: false,
			statusPlanningObligation: null,
			siteViewableFromRoad: undefined,
			siteGridReferenceEasting: undefined,
			siteGridReferenceNorthing: undefined,
			numberOfResidencesNetChange: undefined,
			otherTenantsAgriculturalHolding: null,
			tenantAgriculturalHolding: null,
			typeOfPlanningApplication: undefined
		}
	}
};

export const appealIngestionInputS78Written = {
	...appealIngestionInput,
	appealType: {
		connect: {
			key: 'W'
		}
	},
	appellantCase: {
		create: {
			...appealIngestionInput.appellantCase.create,
			appellantProcedurePreference: 'written',
			appellantProcedurePreferenceDetails: 'Reason for preference',
			appellantProcedurePreferenceDuration: 3,
			appellantProcedurePreferenceWitnessCount: 2,
			agriculturalHolding: false,
			caseworkReason: undefined,
			developmentType: 'minor-dwellings',
			informedTenantsAgriculturalHolding: null,
			planningObligation: false,
			statusPlanningObligation: null,
			siteViewableFromRoad: undefined,
			siteGridReferenceEasting: undefined,
			siteGridReferenceNorthing: undefined,
			numberOfResidencesNetChange: undefined,
			otherTenantsAgriculturalHolding: null,
			tenantAgriculturalHolding: null,
			typeOfPlanningApplication: undefined
		}
	}
};

export const appealIngestionInputS78AssignedTeamId = {
	...appealIngestionInput,
	appealType: {
		connect: {
			key: 'W'
		}
	},
	appellantCase: {
		create: {
			...appealIngestionInput.appellantCase.create,
			appellantProcedurePreference: 'inquiry',
			appellantProcedurePreferenceDetails: 'Reason for preference',
			appellantProcedurePreferenceDuration: 3,
			appellantProcedurePreferenceWitnessCount: 2,
			agriculturalHolding: false,
			caseworkReason: undefined,
			developmentType: 'minor-dwellings',
			informedTenantsAgriculturalHolding: null,
			planningObligation: false,
			statusPlanningObligation: null,
			siteViewableFromRoad: undefined,
			siteGridReferenceEasting: undefined,
			siteGridReferenceNorthing: undefined,
			numberOfResidencesNetChange: undefined,
			otherTenantsAgriculturalHolding: null,
			tenantAgriculturalHolding: null,
			typeOfPlanningApplication: undefined
		}
	}
};

export const appealIngestionInputS20 = {
	...appealIngestionInput,
	appealType: {
		connect: {
			key: 'Y'
		}
	},
	appellantCase: {
		create: {
			...appealIngestionInput.appellantCase.create,
			appellantProcedurePreference: 'inquiry',
			appellantProcedurePreferenceDetails: 'Reason for preference',
			appellantProcedurePreferenceDuration: 3,
			appellantProcedurePreferenceWitnessCount: 2,
			caseworkReason: undefined,
			developmentType: 'minor-dwellings',
			planningObligation: false,
			statusPlanningObligation: null,
			siteViewableFromRoad: undefined,
			siteGridReferenceEasting: undefined,
			siteGridReferenceNorthing: undefined,
			numberOfResidencesNetChange: undefined,
			typeOfPlanningApplication: undefined
		}
	}
};

export const appealIngestionInputS20Written = {
	...appealIngestionInput,
	appealType: {
		connect: {
			key: 'Y'
		}
	},
	appellantCase: {
		create: {
			...appealIngestionInput.appellantCase.create,
			appellantProcedurePreference: 'written',
			appellantProcedurePreferenceDetails: 'Reason for preference',
			appellantProcedurePreferenceDuration: 3,
			appellantProcedurePreferenceWitnessCount: 2,
			caseworkReason: undefined,
			developmentType: 'minor-dwellings',
			planningObligation: false,
			statusPlanningObligation: null,
			siteViewableFromRoad: undefined,
			siteGridReferenceEasting: undefined,
			siteGridReferenceNorthing: undefined,
			numberOfResidencesNetChange: undefined,
			typeOfPlanningApplication: undefined
		}
	}
};

const validLpaQuestionnaireIngestionCommon = {
	data: {
		lpaQuestionnaire: {
			connectOrCreate: {
				create: {
					lpaQuestionnaireSubmittedDate: '2024-06-01T00:00:00.000Z',
					reasonForNeighbourVisits: undefined,
					siteAccessDetails: 'Here it is',
					siteSafetyDetails: 'Fine'
				},
				where: {
					appealId: 100
				}
			}
		},
		neighbouringSites: {
			create: [
				{
					address: {
						create: {
							addressCounty: 'reprehenderit eu mollit Excepteur sit',
							addressLine1: 'deserunt in irure do',
							addressLine2: null,
							addressTown: 'laboris ut enim et laborum',
							postcode: 'aliqua in qui ipsum'
						}
					},
					source: 'lpa'
				}
			]
		}
	},
	where: {
		id: 100
	}
};

export const validLpaQuestionnaireIngestionHas = {
	...validLpaQuestionnaireIngestionCommon,
	data: {
		...validLpaQuestionnaireIngestionCommon.data,
		lpaQuestionnaire: {
			...validLpaQuestionnaireIngestionCommon.data.lpaQuestionnaire,
			connectOrCreate: {
				...validLpaQuestionnaireIngestionCommon.data.lpaQuestionnaire.connectOrCreate,
				create: {
					...validLpaQuestionnaireIngestionCommon.data.lpaQuestionnaire.connectOrCreate.create,
					inConservationArea: true,
					isCorrectAppealType: true,
					isGreenBelt: false,
					listedBuildingDetails: {
						create: [
							{
								affectsListedBuilding: true,
								listEntry: '10001'
							},
							{
								affectsListedBuilding: true,
								listEntry: '10002'
							}
						]
					},
					lpaCostsAppliedFor: false,
					lpaNotificationMethods: {
						create: [
							{
								lpaNotificationMethod: {
									connect: {
										key: 'notice'
									}
								}
							},
							{
								lpaNotificationMethod: {
									connect: {
										key: 'letter'
									}
								}
							}
						]
					},
					lpaStatement: 'cupidatat ipsum eu culpa',
					newConditionDetails: 'cupidatat'
				},
				where: {
					appealId: 100
				}
			}
		},
		neighbouringSites: {
			create: [
				{
					address: {
						create: {
							addressCounty: 'reprehenderit eu mollit Excepteur sit',
							addressLine1: 'deserunt in irure do',
							addressLine2: null,
							addressTown: 'laboris ut enim et laborum',
							postcode: 'aliqua in qui ipsum'
						}
					},
					source: 'lpa'
				}
			]
		}
	},
	where: {
		id: 100
	}
};
export const validLpaQuestionnaireIngestionS78 = {
	...validLpaQuestionnaireIngestionCommon,
	...validLpaQuestionnaireIngestionHas,
	data: {
		...validLpaQuestionnaireIngestionCommon.data,
		...validLpaQuestionnaireIngestionHas.data,
		lpaQuestionnaire: {
			...validLpaQuestionnaireIngestionCommon.data.lpaQuestionnaire,
			...validLpaQuestionnaireIngestionHas.data.lpaQuestionnaire,
			connectOrCreate: {
				...validLpaQuestionnaireIngestionCommon.data.lpaQuestionnaire.connectOrCreate,
				...validLpaQuestionnaireIngestionHas.data.lpaQuestionnaire.connectOrCreate,
				create: {
					...validLpaQuestionnaireIngestionCommon.data.lpaQuestionnaire.connectOrCreate.create,
					...validLpaQuestionnaireIngestionHas.data.lpaQuestionnaire.connectOrCreate.create,
					affectsScheduledMonument: true,
					isAonbNationalLandscape: true,
					isGypsyOrTravellerSite: true,
					isPublicRightOfWay: true,
					eiaEnvironmentalImpactSchedule: 'schedule-1',
					eiaDevelopmentDescription: 'change-extensions',
					eiaSensitiveAreaDetails: '',
					eiaColumnTwoThreshold: true,
					eiaScreeningOpinion: true,
					eiaRequiresEnvironmentalStatement: true,
					eiaCompletedEnvironmentalStatement: true,
					consultedBodiesDetails: '',
					hasProtectedSpecies: true,
					hasStatutoryConsultees: true,
					hasInfrastructureLevy: true,
					hasTreePreservationOrder: true,
					hasConsultationResponses: true,
					hasEmergingPlan: true,
					hasSupplementaryPlanningDocs: true,
					isInfrastructureLevyFormallyAdopted: true,
					infrastructureLevyAdoptedDate: '2023-07-27T20:30:00.000Z',
					infrastructureLevyExpectedDate: '2023-07-27T20:30:00.000Z',
					lpaProcedurePreference: 'written',
					lpaProcedurePreferenceDetails: '',
					lpaProcedurePreferenceDuration: 1,
					designatedSiteNameCustom: undefined,
					designatedSiteNames: {
						create: [
							{
								designatedSite: {
									connect: {
										key: 'SSSI'
									}
								}
							}
						]
					},
					listedBuildingDetails: {
						create: [
							{
								affectsListedBuilding: true,
								listEntry: '10001'
							},
							{
								affectsListedBuilding: true,
								listEntry: '10002'
							},
							{
								affectsListedBuilding: false,
								listEntry: '10023'
							},
							{
								affectsListedBuilding: false,
								listEntry: '17824'
							}
						]
					}
				}
			}
		}
	}
};

export const validLpaQuestionnaireIngestionS20 = {
	...validLpaQuestionnaireIngestionS78,
	data: {
		...validLpaQuestionnaireIngestionS78.data,
		lpaQuestionnaire: {
			...validLpaQuestionnaireIngestionS78.data.lpaQuestionnaire,
			connectOrCreate: {
				...validLpaQuestionnaireIngestionS78.data.lpaQuestionnaire.connectOrCreate,
				create: {
					...validLpaQuestionnaireIngestionS78.data.lpaQuestionnaire.connectOrCreate.create,
					preserveGrantLoan: true,
					historicEnglandConsultation: undefined
				}
			}
		}
	}
};

export const docIngestionInput = {
	documentType: 'appellantCostsApplication',
	documentURI:
		'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
	mime: 'image/jpeg',
	originalFilename: 'oimg.jpg',
	size: 10293,
	fileName: 'img1.jpg',
	blobStorageContainer: 'document-service-uploads',
	blobStoragePath: 'a2c9f873-448e-4dfe-9a19-8239d59a8a88/v1/img1.jpg',
	stage: 'appellant-case',
	documentGuid: 'a2c9f873-448e-4dfe-9a19-8239d59a8a88',
	description: 'Document 001 imported',
	lastModified: '2024-09-12T14:12:20.552Z',
	dateCreated: '2024-03-01T13:48:35.847Z'
};
