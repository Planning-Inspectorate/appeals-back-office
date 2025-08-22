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
			appellantProcedurePreference: null,
			appellantProcedurePreferenceDetails: 'eiusmod ex exercitation',
			appellantProcedurePreferenceDuration: 1,
			appellantProcedurePreferenceWitnessCount: 5,
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
	lpaqSubmission: {
		casedata: {
			caseReference: '6000000',
			lpaQuestionnaireSubmittedDate: '2024-05-31T23:00:00.000Z',
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
					neighbouringSiteAddressLine2: 'string',
					neighbouringSiteAddressTown: 'laboris ut enim et laborum',
					neighbouringSiteAddressCounty: 'reprehenderit eu mollit Excepteur sit',
					neighbouringSiteAddressPostcode: 'aliqua in qui ipsum',
					neighbouringSiteAccessDetails: 'string',
					neighbouringSiteSafetyDetails: 'magna proident incididunt in non'
				}
			],
			affectedListedBuildingNumbers: ['1021466', '1021468'],
			lpaCostsAppliedFor: false,
			// S78 fields
			extraConditions: null,
			isPublicRightOfWay: false,
			affectsScheduledMonument: false,
			hasProtectedSpecies: false,
			isAonbNationalLandscape: null,
			isGypsyOrTravellerSite: false,
			hasInfrastructureLevy: false,
			isInfrastructureLevyFormallyAdopted: null,
			infrastructureLevyAdoptedDate: null,
			infrastructureLevyExpectedDate: null,
			lpaProcedurePreference: 'hearing',
			lpaProcedurePreferenceDetails: 'pref details lpa',
			lpaProcedurePreferenceDuration: 3,
			reasonForNeighbourVisits: null,
			changedListedBuildingNumbers: ['1021469', '1021470'],
			designatedSitesNames: ['cSAC', 'SAC', 'customVal1', 'customVal2'],
			eiaSensitiveAreaDetails: null,
			consultedBodiesDetails: null,
			eiaScreeningOpinion: null,
			eiaColumnTwoThreshold: null,
			eiaRequiresEnvironmentalStatement: null,
			eiaEnvironmentalImpactSchedule: null,
			eiaDevelopmentDescription: null,
			eiaCompletedEnvironmentalStatement: null,
			hasStatutoryConsultees: false,
			importantInformation: null,
			redeterminedIndicator: null,
			dateCostsReportDespatched: null,
			dateNotRecoveredOrDerecovered: null,
			dateRecovered: null,
			originalCaseDecisionDate: null,
			targetDate: null,
			siteNoticesSentDate: null,
			siteWithinSSSI: false
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
		//estimatedDays: "5",
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
	}
};

const documentsApiRequest = {
	dev: {
		appellant: {
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
			]
		},
		lpaq: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '001',
					documentType: 'lpaCostsApplication',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: 'img1.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]
		},
		interestedPartyComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '001',
					documentType: 'interestedPartyComment',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: 'img1.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]
		},
		lpaStatement: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '001',
					documentType: 'lpaStatement',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: 'img1.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]
		},
		lpaFinalComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '001',
					documentType: 'lpaFinalComment',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: 'img1.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]
		},
		appellantFinalComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '001',
					documentType: 'appellantFinalComment',
					documentURI:
						'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
					filename: 'img1.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
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
					documentId: '001',
					documentType: 'appellantCostsApplication',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: 'img1.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]
		},
		lpaq: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '001',
					documentType: 'lpaCostsApplication',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: 'img1.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]
		},
		interestedPartyComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '001',
					documentType: 'interestedPartyComment',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: 'img1.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]
		},
		lpaStatement: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '001',
					documentType: 'lpaStatement',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: 'img1.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]
		},
		lpaFinalComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '001',
					documentType: 'lpaFinalComment',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: 'img1.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]
		},
		appellantFinalComment: {
			documents: [
				{
					dateCreated: '2024-03-01T13:48:35.847Z',
					documentId: '001',
					documentType: 'appellantFinalComment',
					documentURI:
						'https://pinsstdocstestukw001.blob.core.windows.net/uploads/087468cc-ae2a-4960-9683-0c2c276607d4/a96085b5-b1ed-4801-a2f9-3b1af3836a61/087468cc-ae2a-4960-9683-0c2c276607d4-appellant-submission.pdf',
					filename: 'img1.jpg',
					mime: 'image/jpeg',
					originalFilename: 'oimg.jpg',
					size: 10293
				}
			]
		}
	}
};

export { appealsApiRequests, documentsApiRequest };
