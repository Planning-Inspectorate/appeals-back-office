export default {
	id: 2,
	reference: '6000002',
	submissionId: null,
	appealTypeId: 2,
	procedureTypeId: 3,
	addressId: 1,
	lpaId: 1,
	applicationReference: '38699/APP/0/694045',
	caseCreatedDate: new Date('2024-11-27T15:08:53.894Z'),
	caseUpdatedDate: new Date('2024-11-27T15:08:53.894Z'),
	caseValidDate: new Date('2024-05-27T14:08:50.414Z'),
	caseExtensionDate: null,
	caseStartedDate: new Date('2024-10-16T14:08:50.414Z'),
	casePublishedDate: null,
	caseCompletedDate: null,
	withdrawalRequestDate: null,
	caseResubmittedTypeId: null,
	caseTransferredId: null,
	allocationId: null,
	appellantId: 2,
	agentId: null,
	caseOfficerUserId: 1,
	inspectorUserId: null,
	address: {
		id: 1,
		addressLine1: '19 Beauchamp Road',
		addressLine2: null,
		postcode: 'BS7 8LQ',
		addressCounty: null,
		addressTown: 'Bristol',
		addressCountry: null
	},
	procedureType: {
		id: 3,
		name: 'Written',
		key: 'written'
	},
	parentAppeals: [],
	childAppeals: [],
	neighbouringSites: [],
	allocation: null,
	specialisms: [],
	appellantCase: {
		id: 2,
		appealId: 2,
		appellantCaseValidationOutcomeId: 1,
		applicationDate: new Date('2024-10-16T14:08:50.409Z'),
		applicationDecision: 'refused',
		applicationDecisionDate: new Date('2024-10-27T15:08:50.409Z'),
		caseSubmittedDate: new Date('2024-11-27T15:08:53.894Z'),
		caseSubmissionDueDate: null,
		siteAccessDetails: null,
		siteSafetyDetails: null,
		siteAreaSquareMetres: 120,
		floorSpaceSquareMetres: 340,
		ownsAllLand: true,
		ownsSomeLand: false,
		knowsOtherOwnersId: 1,
		knowsAllOwnersId: null,
		hasAdvertisedAppeal: true,
		appellantCostsAppliedFor: null,
		originalDevelopmentDescription: 'lorem ipsum',
		changedDevelopmentDescription: false,
		ownersInformed: null,
		enforcementNotice: null,
		isGreenBelt: true,
		agriculturalHolding: false,
		tenantAgriculturalHolding: false,
		otherTenantsAgriculturalHolding: false,
		informedTenantsAgriculturalHolding: true,
		appellantProcedurePreference: 'written',
		appellantProcedurePreferenceDetails: null,
		appellantProcedurePreferenceDuration: 1,
		appellantProcedurePreferenceWitnessCount: 0,
		planningObligation: false,
		statusPlanningObligation: null,
		siteViewableFromRoad: null,
		caseworkReason: null,
		developmentType: null,
		jurisdiction: null,
		numberOfResidencesNetChange: null,
		siteGridReferenceEasting: null,
		siteGridReferenceNorthing: null,
		appellantCaseIncompleteReasonsSelected: [],
		appellantCaseInvalidReasonsSelected: [],
		appellantCaseValidationOutcome: {
			id: 1,
			name: 'Valid'
		},
		knowsOtherOwners: {
			id: 1,
			key: 'some',
			name: 'Some'
		},
		knowsAllOwners: null
	},
	appellant: {
		id: 2,
		organisationName: 'Eva Sharma Ltd',
		salutation: null,
		firstName: 'Eva',
		middleName: null,
		lastName: 'Sharma',
		email: 'test9@example.com',
		website: null,
		phoneNumber: null,
		addressId: null
	},
	assignedTeam: {
		id: 1,
		email: 'temp@email.com',
		name: 'temp'
	},
	agent: null,
	lpa: {
		id: 2,
		name: 'Dorset Council',
		lpaCode: 'DORS',
		email: 'dors@lpa-email.gov.uk'
	},
	appealStatus: [
		{
			id: 1,
			status: 'statements',
			createdAt: new Date('2024-05-27T14:08:50.414Z'),
			valid: true,
			appealId: 2,
			subStateMachineName: null,
			compoundStateName: null
		}
	],
	stateList: [
		{
			completed: true,
			key: 'assign_case_officer'
		},
		{
			completed: true,
			key: 'validation'
		},
		{
			completed: true,
			key: 'ready_to_start'
		},
		{
			completed: false,
			key: 'lpa_questionnaire'
		},
		{
			completed: false,
			key: 'statements'
		},
		{
			completed: false,
			key: 'final_comments'
		},
		{
			completed: false,
			key: 'event'
		},
		{
			completed: false,
			key: 'awaiting_event'
		},
		{
			completed: false,
			key: 'issue_determination'
		},
		{
			completed: false,
			key: 'awaiting_transfer'
		},
		{
			completed: false,
			key: 'invalid'
		},
		{
			completed: false,
			key: 'transferred'
		},
		{
			completed: false,
			key: 'closed'
		},
		{
			completed: false,
			key: 'withdrawn'
		},
		{
			completed: false,
			key: 'complete'
		}
	],
	appealTimetable: {
		id: 2,
		appealId: 2,
		caseResubmissionDueDate: null,
		lpaQuestionnaireDueDate: new Date('2024-10-23T22:59:00.000Z'),
		ipCommentsDueDate: new Date('2024-11-20T23:59:00.000Z'),
		appellantStatementDueDate: new Date('2024-11-20T23:59:00.000Z'),
		lpaStatementDueDate: new Date('2024-11-20T23:59:00.000Z'),
		finalCommentsDueDate: new Date('2024-12-04T23:59:00.000Z'),
		s106ObligationDueDate: new Date('2024-12-04T23:59:00.000Z'),
		statementOfCommonGroundDueDate: new Date('2024-12-04T23:59:00.000Z'),
		planningObligationDueDate: new Date('2024-12-04T23:59:00.000Z'),
		issueDeterminationDate: null,
		proofOfEvidenceAndWitnessesDueDate: new Date('2024-12-04T23:59:00.000Z')
	},
	appealType: {
		id: 2,
		type: 'Planning appeal',
		key: 'W',
		processCode: null,
		enabled: false
	},
	caseOfficer: {
		id: 1,
		azureAdUserId: '00000000-0000-0000-0000-000000000000'
	},
	inspector: null,
	inspectorDecision: null,
	lpaQuestionnaire: {
		id: 2,
		appealId: 2,
		lpaQuestionnaireValidationOutcomeId: null,
		lpaqCreatedDate: new Date('2023-05-08T23:00:00.000Z'),
		lpaQuestionnaireSubmittedDate: new Date('2023-05-08T23:00:00.000Z'),
		lpaStatement: null,
		newConditionDetails: null,
		siteAccessDetails: 'There is a tall hedge around the site which obstructs the view of the site',
		siteSafetyDetails: 'There may be no mobile reception at the site',
		isCorrectAppealType: true,
		inConservationArea: true,
		lpaCostsAppliedFor: false,
		isGreenBelt: false,
		affectsScheduledMonument: null,
		hasProtectedSpecies: null,
		isAonbNationalLandscape: null,
		designatedSitesNames: null,
		isGypsyOrTravellerSite: null,
		isPublicRightOfWay: null,
		eiaEnvironmentalImpactSchedule: 'schedule-1',
		eiaDevelopmentDescription: 'mineral-industry',
		eiaSensitiveAreaDetails: null,
		eiaColumnTwoThreshold: true,
		eiaScreeningOpinion: null,
		eiaRequiresEnvironmentalStatement: true,
		eiaCompletedEnvironmentalStatement: null,
		consultedBodiesDetails: null,
		hasStatutoryConsultees: null,
		hasInfrastructureLevy: true,
		isInfrastructureLevyFormallyAdopted: false,
		infrastructureLevyAdoptedDate: null,
		infrastructureLevyExpectedDate: null,
		lpaProcedurePreference: 'inquiry',
		lpaProcedurePreferenceDetails: 'Need for a detailed examination',
		lpaProcedurePreferenceDuration: null,
		lpaFinalCommentDetails: null,
		lpaAddedWitnesses: null,
		siteWithinSSSI: null,
		reasonForNeighbourVisits: null,
		importantInformation: null,
		redeterminedIndicator: null,
		dateCostsReportDespatched: null,
		dateNotRecoveredOrDerecovered: null,
		dateRecovered: null,
		originalCaseDecisionDate: null,
		targetDate: null,
		siteNoticesSentDate: null,
		listedBuildingDetails: [
			{
				id: 1,
				lpaQuestionnaireId: 2,
				listEntry: '1264111',
				affectsListedBuilding: false
			},
			{
				id: 2,
				lpaQuestionnaireId: 2,
				listEntry: '1356956',
				affectsListedBuilding: false
			},
			{
				id: 3,
				lpaQuestionnaireId: 3,
				listEntry: '1202152',
				affectsListedBuilding: true
			},
			{
				id: 4,
				lpaQuestionnaireId: 4,
				listEntry: '1356318',
				affectsListedBuilding: true
			}
		],
		lpaNotificationMethods: [
			{
				notificationMethodId: 1,
				lpaQuestionnaireId: 2,
				lpaNotificationMethod: {
					id: 1,
					key: 'letter',
					name: 'Letter/email to interested parties'
				}
			},
			{
				notificationMethodId: 2,
				lpaQuestionnaireId: 2,
				lpaNotificationMethod: {
					id: 2,
					key: 'advert',
					name: 'A press advert'
				}
			}
		],
		lpaQuestionnaireIncompleteReasonsSelected: [],
		lpaQuestionnaireValidationOutcome: null
	},
	siteVisit: null,
	caseNotes: [],
	representations: [
		{
			id: 4474,
			appealId: 2377,
			representationType: 'comment',
			dateCreated: new Date('2024-11-27T15:08:55.585Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.585Z'),
			originalRepresentation:
				'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.',
			redactedRepresentation: null,
			representedId: 5975,
			representativeId: null,
			lpaCode: null,
			status: 'awaiting_review',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'back-office-appeals'
		},
		{
			id: 4475,
			appealId: 2377,
			representationType: 'comment',
			dateCreated: new Date('2024-11-27T15:08:55.595Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.595Z'),
			originalRepresentation:
				'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.',
			redactedRepresentation: null,
			representedId: 5976,
			representativeId: null,
			lpaCode: null,
			status: 'awaiting_review',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'citizen'
		},
		{
			id: 4476,
			appealId: 2377,
			representationType: 'comment',
			dateCreated: new Date('2024-11-27T15:08:55.603Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.603Z'),
			originalRepresentation:
				'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.',
			redactedRepresentation: null,
			representedId: 5977,
			representativeId: null,
			lpaCode: null,
			status: 'valid',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'back-office-appeals'
		},
		{
			id: 4477,
			appealId: 2377,
			representationType: 'comment',
			dateCreated: new Date('2024-11-27T15:08:55.612Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.612Z'),
			originalRepresentation:
				'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.',
			redactedRepresentation: null,
			representedId: 5978,
			representativeId: null,
			lpaCode: null,
			status: 'awaiting_review',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'citizen'
		},
		{
			id: 4478,
			appealId: 2377,
			representationType: 'comment',
			dateCreated: new Date('2024-11-27T15:08:55.622Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.622Z'),
			originalRepresentation:
				'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.',
			redactedRepresentation: null,
			representedId: 5979,
			representativeId: null,
			lpaCode: null,
			status: 'valid',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'back-office-appeals'
		},
		{
			id: 4479,
			appealId: 2377,
			representationType: 'comment',
			dateCreated: new Date('2024-11-27T15:08:55.632Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.632Z'),
			originalRepresentation:
				'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.',
			redactedRepresentation: null,
			representedId: 5980,
			representativeId: null,
			lpaCode: null,
			status: 'awaiting_review',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'citizen'
		},
		{
			id: 4480,
			appealId: 2377,
			representationType: 'comment',
			dateCreated: new Date('2024-11-27T15:08:55.641Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.641Z'),
			originalRepresentation:
				'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.',
			redactedRepresentation: null,
			representedId: 5981,
			representativeId: null,
			lpaCode: null,
			status: 'valid',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'back-office-appeals'
		},
		{
			id: 4481,
			appealId: 2377,
			representationType: 'comment',
			dateCreated: new Date('2024-11-27T15:08:55.650Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.650Z'),
			originalRepresentation:
				'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.',
			redactedRepresentation: null,
			representedId: 5982,
			representativeId: null,
			lpaCode: null,
			status: 'valid',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'citizen'
		},
		{
			id: 4482,
			appealId: 2377,
			representationType: 'comment',
			dateCreated: new Date('2024-11-27T15:08:55.660Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.660Z'),
			originalRepresentation:
				'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.',
			redactedRepresentation: null,
			representedId: 5983,
			representativeId: null,
			lpaCode: null,
			status: 'awaiting_review',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'back-office-appeals'
		},
		{
			id: 4483,
			appealId: 2377,
			representationType: 'comment',
			dateCreated: new Date('2024-11-27T15:08:55.670Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.670Z'),
			originalRepresentation:
				'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.',
			redactedRepresentation: null,
			representedId: 5984,
			representativeId: null,
			lpaCode: null,
			status: 'invalid',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'citizen'
		},
		{
			id: 4484,
			appealId: 2377,
			representationType: 'statement',
			dateCreated: new Date('2024-11-27T15:08:55.688Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.688Z'),
			originalRepresentation: 'Statement from appellant',
			redactedRepresentation: null,
			representedId: 5985,
			representativeId: null,
			lpaCode: null,
			status: 'awaiting_review',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'citizen'
		},
		{
			id: 4485,
			appealId: 2377,
			representationType: 'statement',
			dateCreated: new Date('2024-11-27T15:08:55.697Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.697Z'),
			originalRepresentation: 'Statement from LPA',
			redactedRepresentation: null,
			representedId: null,
			representativeId: null,
			lpaCode: 'DORS',
			status: 'awaiting_review',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'citizen'
		},
		{
			id: 4486,
			appealId: 2377,
			representationType: 'appellant_final_comment',
			dateCreated: new Date('2024-11-27T15:08:55.704Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.704Z'),
			originalRepresentation: 'Final comment from appellant',
			redactedRepresentation: null,
			representedId: 5875,
			representativeId: null,
			lpaCode: null,
			status: 'awaiting_review',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'citizen'
		},
		{
			id: 4487,
			appealId: 2377,
			representationType: 'lpa_final_comment',
			dateCreated: new Date('2024-11-27T15:08:55.711Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.711Z'),
			originalRepresentation: 'Final comment from LPA',
			redactedRepresentation: null,
			representedId: null,
			representativeId: null,
			lpaCode: 'DORS',
			status: 'awaiting_review',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'citizen'
		},
		{
			id: 4488,
			appealId: 2377,
			representationType: 'appellant_proofs_evidence',
			dateCreated: new Date('2024-11-27T15:08:55.704Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.704Z'),
			originalRepresentation: 'Proof of evidence from appellant',
			redactedRepresentation: null,
			representedId: 5875,
			representativeId: null,
			lpaCode: null,
			status: 'awaiting_review',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'citizen'
		},
		{
			id: 4489,
			appealId: 2377,
			representationType: 'lpa_proofs_evidence',
			dateCreated: new Date('2024-11-27T15:08:55.711Z'),
			dateLastUpdated: new Date('2024-11-27T15:08:55.711Z'),
			originalRepresentation: 'Proof of evidence from LPA',
			redactedRepresentation: null,
			representedId: null,
			representativeId: null,
			lpaCode: 'DORS',
			status: 'awaiting_review',
			reviewer: null,
			notes: null,
			siteVisitRequested: false,
			source: 'citizen'
		}
	],
	linkedAppeals: [],
	relatedAppeals: []
};
