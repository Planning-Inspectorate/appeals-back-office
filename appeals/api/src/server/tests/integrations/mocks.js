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

export const validLpaQuestionnaire = {
	casedata: {
		caseReference: '6000000',
		lpaQuestionnaireSubmittedDate: new Date(2024, 5, 1).toISOString(),
		lpaStatement: 'cupidatat ipsum eu culpa',
		siteAccessDetails: ['Here it is'],
		siteSafetyDetails: ['Fine'],
		isCorrectAppealType: true,
		isGreenBelt: false,
		inConservationArea: true,
		newConditionDetails: 'cupidatat',
		notificationMethod: ['notice', 'letter'],
		nearbyCaseReferences: ['1000000'],
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
		affectedListedBuildingNumbers: ['10001', '10002'],
		lpaCostsAppliedFor: false
	},
	documents: [
		{
			dateCreated: '2024-03-01T13:48:35.847Z',
			documentId: '001',
			documentType: 'appellantCostsApplication',
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
