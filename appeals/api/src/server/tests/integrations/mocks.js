import { randomUUID } from 'node:crypto';

export const validAppellantCase = {
	casedata: {
		submissionId: randomUUID(),
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
			isGreenBelt: false,
			appellantProcedurePreference: undefined,
			appellantProcedurePreferenceDetails: undefined,
			appellantProcedurePreferenceDuration: undefined,
			inquiryHowManyWitnesses: undefined
		}
	},
	neighbouringSites: {
		create: []
	},
	folders: {
		create: [
			{
				path: 'appellant-case/appellantStatement'
			},
			{
				path: 'appellant-case/originalApplicationForm'
			},
			{
				path: 'appellant-case/applicationDecisionLetter'
			},
			{
				path: 'appellant-case/changedDescription'
			},
			{
				path: 'appellant-case/appellantCaseWithdrawalLetter'
			},
			{
				path: 'appellant-case/appellantCaseCorrespondence'
			},
			{
				path: 'appellant-case/designAccessStatement'
			},
			{
				path: 'appellant-case/plansDrawings'
			},
			{
				path: 'appellant-case/newPlansDrawings'
			},
			{
				path: 'appellant-case/planningObligation'
			},
			{
				path: 'appellant-case/ownershipCertificate'
			},
			{
				path: 'appellant-case/otherNewDocuments'
			},
			{
				path: 'lpa-questionnaire/whoNotified'
			},
			{
				path: 'lpa-questionnaire/whoNotifiedSiteNotice'
			},
			{
				path: 'lpa-questionnaire/whoNotifiedLetterToNeighbours'
			},
			{
				path: 'lpa-questionnaire/whoNotifiedPressAdvert'
			},
			{
				path: 'lpa-questionnaire/conservationMap'
			},
			{
				path: 'lpa-questionnaire/otherPartyRepresentations'
			},
			{
				path: 'lpa-questionnaire/planningOfficerReport'
			},
			{
				path: 'lpa-questionnaire/lpaCaseCorrespondence'
			},
			{
				path: 'costs/appellantCostsApplication'
			},
			{
				path: 'costs/appellantCostsWithdrawal'
			},
			{
				path: 'costs/appellantCostsCorrespondence'
			},
			{
				path: 'costs/lpaCostsApplication'
			},
			{
				path: 'costs/lpaCostsWithdrawal'
			},
			{
				path: 'costs/lpaCostsCorrespondence'
			},
			{
				path: 'costs/costsDecisionLetter'
			},
			{
				path: 'internal/crossTeamCorrespondence'
			},
			{
				path: 'internal/inspectorCorrespondence'
			},
			{
				path: 'internal/uncategorised'
			},
			{
				path: 'appeal-decision/caseDecisionLetter'
			}
		]
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
