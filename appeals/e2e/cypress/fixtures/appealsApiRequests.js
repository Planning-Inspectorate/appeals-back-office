// @ts-nocheck
/**
 * Takes a base document object and returns new version with unique values for id and filenames   
 * @param {Object} baseDocument base document to be overridden 
 * @returns new version of document with unique values for id and filenames 
 */
export const generateUniqueDocument = (baseDocument) => {
	if (!baseDocument) return {}; // some requests do not need a document, e.g. setup inquiry and hearing 

	// generate random id 
	const id = crypto.randomUUID();

	const document = baseDocument.documents[0];

	// return new document with unique properties 
	return {
		documents: [
			{
				...document,
				documentId: `doc-${id}`,
				filename: `img-${id}.jpg`,
				originalFilename: `oimg-${id}.jpg`,
			}
		]
	};
} 

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
				neighbouringSiteAddressLine2: 'string',
				neighbouringSiteAddressTown: 'laboris ut enim et laborum',
				neighbouringSiteAddressCounty: 'reprehenderit eu mollit Excepteur sit',
				neighbouringSiteAddressPostcode: 'aliqua in qui ipsum',
				neighbouringSiteAccessDetails: 'string',
				neighbouringSiteSafetyDetails: 'magna proident incididunt in non'
			}
		],
		reasonForNeighbourVisits: undefined
	},
}

export const validLpaQuestionnaireHas = {
	casedata: {
		...validLpaQuestionnaireCommon.casedata,
		caseType: 'W',
		lpaStatement: 'cupidatat ipsum eu culpa',
		isCorrectAppealType: true,
		isGreenBelt: false,
		inConservationArea: true,
		newConditionDetails: 'cupidatat',
		notificationMethod: ['notice', 'letter'],
		affectedListedBuildingNumbers: ['1021466', '1021468'],
		lpaCostsAppliedFor: false
	},
};

const appealsApiRequests = {
	caseSubmission: {
		casedata: {
			submissionId: 'e4d42124-364c-4bda-af1f-3c40e4b09ff3',
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
			nearbyCaseReferences: [],
			neighbouringSiteAddresses: [],
			originalDevelopmentDescription: 'A test description',
			ownersInformed: true,
			ownsAllLand: true,
			ownsSomeLand: true,
			isSiteOnHighwayLand: true,
			isAdvertInPosition: true,
			hasLandownersPermission: true,
			advertDetails: [],
			appellantProcedurePreference: "written",
			appellantProcedurePreferenceDetails: "test",
			appellantProcedurePreferenceDuration: 10,
			appellantProcedurePreferenceWitnessCount: 5,
			siteAccessDetails: ['Come and see'],
			siteAddressCounty: 'Somewhere',
			siteAddressLine1: 'e2e Test Address',
			siteAddressLine2: 'Somewhere St',
			siteAddressPostcode: 'BS21 6LE',
			siteAddressTown: 'Somewhereville',
			siteAreaSquareMetres: 22,
			siteSafetyDetails: ["It's dangerous"],
			isGreenBelt: false,
			typeOfPlanningApplication: 'full-appeal',
			// S78 fields
			developmentType: 'minor-dwellings',
			agriculturalHolding: true,
			tenantAgriculturalHolding: true,
			otherTenantsAgriculturalHolding: null,
			informedTenantsAgriculturalHolding: null,
			planningObligation: false,
			statusPlanningObligation: 'proident aute'
		},
		users: [
			{
				emailAddress: 'appellant@test.com',
				firstName: 'Testy',
				lastName: 'McTest',
				salutation: 'string',
				serviceUserType: 'Appellant',
				telephoneNumber: '01234 818181',
				organisation: 'K and C'
			},
			{
				emailAddress: 'agent@test.com',
				firstName: 'Agent',
				lastName: 'Bond',
				salutation: 'string',
				serviceUserType: 'Agent',
				telephoneNumber: '01207 818181',
				organisation: 'K and C'
			}
		]
	},
	casAdvertsSubmission: {
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
			typeOfPlanningApplication: 'advertisement',
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
			advertDetails: [
				{
					advertType: null,
					isAdvertInPosition: true,
					isSiteOnHighwayLand: true
				}
			],
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
	},
	advertsSubmission: {
		casedata: {
			submissionId: '14960baa-3d0f-4db9-9e84-0c75be891560',
			advertisedAppeal: true,
			appellantCostsAppliedFor: false,
			appellantProcedurePreference: 'inquiry',
			appellantProcedurePreferenceDetails: 'Reason for preference',
			appellantProcedurePreferenceDuration: 3,
			appellantProcedurePreferenceWitnessCount: 2,
			applicationDate: '2024-01-01T00:00:00.000Z',
			applicationDecision: 'refused',
			applicationDecisionDate: '2024-01-01T00:00:00.000Z',
			applicationReference: '123',
			caseProcedure: 'written',
			caseSubmissionDueDate: '2024-03-25T23:59:59.999Z',
			caseSubmittedDate: '2024-03-25T23:59:59.999Z',
			caseType: 'H',
			typeOfPlanningApplication: 'advertisement',
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
			advertDetails: [
				{
					advertType: null,
					isAdvertInPosition: true,
					isSiteOnHighwayLand: true
				}
			],
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
	},
	lpaqSubmission: {
		casedata: {
			...validLpaQuestionnaireCommon.casedata,
			...validLpaQuestionnaireHas.casedata,
			changedListedBuildingNumbers: [],
			designatedSitesNames: ['cSAC', 'SAC', 'customVal1'],
			affectsScheduledMonument: false,
			isAonbNationalLandscape: null,
			isGypsyOrTravellerSite: false,
			isPublicRightOfWay: false,
			eiaEnvironmentalImpactSchedule: null,
			eiaDevelopmentDescription: null,
			eiaSensitiveAreaDetails: '',
			eiaColumnTwoThreshold: null,
			eiaScreeningOpinion: null,
			eiaRequiresEnvironmentalStatement: null,
			eiaCompletedEnvironmentalStatement: null,
			consultedBodiesDetails: null,
			hasProtectedSpecies: false,
			hasStatutoryConsultees: false,
			hasInfrastructureLevy: false,
			hasTreePreservationOrder: true, // new required field
			hasConsultationResponses: true, // new required field
			hasEmergingPlan: true, // new required field
			hasSupplementaryPlanningDocs: true, // new required field
			isInfrastructureLevyFormallyAdopted: null,
			infrastructureLevyAdoptedDate: null,
			infrastructureLevyExpectedDate: null,
			lpaProcedurePreference: 'hearing',
			lpaProcedurePreferenceDetails: 'pref details lpa',
			lpaProcedurePreferenceDuration: 3,
			lpaFinalCommentDetails: '',
			lpaAddedWitnesses: true, // new required field
			siteWithinSSSI: false,
			reasonForNeighbourVisits: null,
			importantInformation: null,
			redeterminedIndicator: null,
			dateCostsReportDespatched: '2023-07-27T20:30:00.000Z',
			dateNotRecoveredOrDerecovered: '2023-07-27T20:30:00.000Z',
			dateRecovered: '2023-07-27T20:30:00.000Z',
			originalCaseDecisionDate: '2023-07-27T20:30:00.000Z',
			targetDate: '2023-07-27T20:30:00.000Z',
			siteNoticesSentDate: '2023-07-27T20:30:00.000Z',
		}
	},
	interestedPartyComment: {
		caseReference: '6000000',
		representation: 'Hello, not about cheese but still a rep of some kind (IP comment)',
		representationType: 'comment',
		representationSubmittedDate: new Date(),
		newUser: {
			emailAddress: 'interestedparty@test.com',
			firstName: 'Testy',
			lastName: 'McTest',
			salutation: 'Mr',
			serviceUserType: 'InterestedParty',
			organisation: 'A company',
			telephoneNumber: '0123456789'
		}
	},
	lpaStatement: {
		caseReference: '6000000',
		representation: 'Hello, not about cheese but still a rep of some kind (LPA statement)',
		representationType: 'statement',
		representationSubmittedDate: '2025-01-22T13:48:35.847Z',
		lpaCode: 'Q9999'
	},
	appellantFinalComment: {
		caseReference: '6000000',
		representation:
			'Hello, not about cheese but still a rep of some kind (Appellant final comment)',
		representationType: 'final_comment',
		representationSubmittedDate: '2025-01-22T13:48:35.847Z',
		serviceUserId: '1'
	},
	lpaFinalComment: {
		caseReference: '6000000',
		representation: 'Hello, not about cheese but still a rep of some kind (LPA final comment)',
		representationType: 'final_comment',
		representationSubmittedDate: '2025-01-22T13:48:35.847Z',
		lpaCode: 'Q9999'
	},
	hearingDetails: {
		hearingStartTime: '2026-11-10T00:00:00.000Z',
		hearingEndTime: '2026-11-10T00:00:00.000Z',
		addressId: 1,
		address: {
			addressLine1: '1 Grove Cottage',
			addressLine2: 'Shotesham Road',
			country: 'United Kingdom',
			county: 'Devon',
			postcode: 'NR35 2ND',
			town: 'Woodton'
		}
	},
	inquiryDetails: {
		inquiryStartTime: "2026-11-10T00:00:00.000Z",
		inquiryEndTime: "2026-11-10T00:00:00.000Z",
		startDate: "2026-11-10T00:00:00.000Z",
		estimatedDays: "5",
		lpaQuestionnaireDueDate: "2026-11-10T00:00:00.000Z",
		statementDueDate: "2026-11-10T00:00:00.000Z",
		ipCommentsDueDate: "2026-11-10T00:00:00.000Z",
		statementOfCommonGroundDueDate: "2026-11-10T00:00:00.000Z",
		proofOfEvidenceAndWitnessesDueDate: "2026-11-10T00:00:00.000Z",
		planningObligationDueDate: "2026-11-10T00:00:00.000Z",
		address: {
			addressLine1: "1 Grove Cottage",
			addressLine2: "Shotesham Road",
			country: "United Kingdom",
			county: "Devon",
			postcode: "NR35 2ND",
			town: "Woodton"
		}
	},
	estimateDetails: {
		preparationTime: 1.5,
		sittingTime: 0.5,
		reportingTime: 2
	},
	appellantProofOfEvidence: {
		caseReference: '6000000',
		representation: 'Hello, not about cheese but still a rep of some kind (Appellant Proof Of Evidence)',
		representationType: 'proofs_evidence',
		representationSubmittedDate: new Date(new Date().setDate(new Date().getDate() - 1)),
		newUser: {
			emailAddress: 'interestedparty@test.com',
			firstName: 'Testy',
			lastName: 'McTest',
			salutation: 'Mr',
			serviceUserType: 'InterestedParty',
			organisation: 'A company',
			telephoneNumber: '0123456789'
		}
	},
	lpaProofOfEvidence: {
		caseReference: '6000000',
		representation: 'Hello, not about cheese but still a rep of some kind (LPA Appellant Proof Of Evidence)',
		representationType: 'proofs_evidence',
		representationSubmittedDate: new Date(new Date().setDate(new Date().getDate() - 1)),
		lpaCode: 'Q9999'
	},
	rule6Party: {
		serviceUser: {
			organisationName: "Concerned Locals Consortium",
			email: "concernedlocals@gmail.com"
		}
	}
};

const documentsApiRequest = {
	dev: {
		appellant: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id  
					documentType: 'appellantCostsApplication',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		lpaq: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'lpaCostsApplication',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		interestedPartyComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'interestedPartyComment',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
				//generateRandomId
			]
		},
		lpaStatement: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'lpaStatement',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		lpaFinalComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'lpaFinalComment',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		appellantFinalComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'appellantFinalComment',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		appellantProofOfEvidence: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'appellantProofOfEvidence',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		lpaProofOfEvidence: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'lpaProofOfEvidence',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		}
	},
	test: {
		appellant: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'appellantCostsApplication',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		lpaq: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'lpaCostsApplication',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		interestedPartyComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'interestedPartyComment',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		lpaStatement: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'lpaStatement',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		lpaFinalComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'lpaFinalComment',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename:  '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		appellantFinalComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'appellantFinalComment',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		appellantProofOfEvidence: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'appellantProofOfEvidence',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		},
		lpaProofOfEvidence: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '{placeholder}', // will be replaced by generated id 
					documentType: 'lpaProofOfEvidence',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: '{placeholder}', // will be replaced by generated id 
					mime: 'image/jpeg',
					originalFilename: '{placeholder}', // will be replaced by generated id 
					size: 10293
				}
			]
		}
	}
};

export { appealsApiRequests, documentsApiRequest };
