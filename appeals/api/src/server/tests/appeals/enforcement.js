export default {
	id: 1,
	reference: '60000001',
	submissionId: null,
	appealTypeId: 1,
	procedureTypeId: null,
	addressId: 1,
	lpaId: 1,
	applicationReference: '19241/APP/2/231037',
	caseCreatedDate: new Date('2024-11-27T15:08:53.375Z'),
	caseUpdatedDate: new Date('2024-11-27T15:08:53.375Z'),
	caseValidDate: new Date('2024-11-13T15:08:50.414Z'),
	caseExtensionDate: null,
	caseStartedDate: new Date('2024-11-27T15:08:50.414Z'),
	casePublishedDate: null,
	caseCompletedDate: null,
	withdrawalRequestDate: null,
	caseResubmittedTypeId: null,
	caseTransferredId: null,
	allocationId: null,
	appellantId: 1,
	agentId: 2,
	caseOfficerUserId: 1,
	inspectorUserId: null,
	address: {
		id: 1,
		addressLine1: 'FOR TRAINERS ONLY',
		addressLine2: '1 Grove Cottage',
		postcode: 'NR35 2ND',
		addressCounty: null,
		addressTown: 'Woodton',
		addressCountry: null
	},
	procedureType: null,
	parentAppeals: [],
	childAppeals: [],
	otherAppeals: [],
	neighbouringSites: [],
	allocation: null,
	specialisms: [],
	appellantCase: {
		id: 1,
		appealId: 1,
		appellantCaseValidationOutcomeId: 1,
		applicationDate: new Date('2024-10-16T14:08:50.409Z'),
		applicationDecision: 'refused',
		applicationDecisionDate: new Date('2024-10-27T15:08:50.409Z'),
		caseSubmittedDate: new Date('2024-11-27T15:08:53.375Z'),
		caseSubmissionDueDate: null,
		siteAccessDetails: null,
		siteSafetyDetails: null,
		siteAreaSquareMetres: 20.2,
		floorSpaceSquareMetres: 20,
		ownsAllLand: true,
		ownsSomeLand: false,
		knowsOtherOwnersId: 1,
		knowsAllOwnersId: null,
		hasAdvertisedAppeal: true,
		appellantCostsAppliedFor: null,
		originalDevelopmentDescription: 'lorem ipsum',
		changedDevelopmentDescription: false,
		ownersInformed: null,
		enforcementNotice: true,
		enforcementNoticeListedBuilding: false,
		interestInLand: 'owner',
		writtenOrVerbalPermission: 'yes',
		enforcementEffectiveDate: new Date('2024-10-17T14:08:50.409Z'),
		enforcementIssueDate: new Date('2024-10-16T14:08:50.409Z'),
		applicationDevelopmentAllOrPart: 'all-of-the-development',
		isGreenBelt: true,
		agriculturalHolding: null,
		tenantAgriculturalHolding: null,
		otherTenantsAgriculturalHolding: null,
		informedTenantsAgriculturalHolding: null,
		appellantProcedurePreference: null,
		appellantProcedurePreferenceDetails: null,
		appellantProcedurePreferenceDuration: null,
		appellantProcedurePreferenceWitnessCount: null,
		planningObligation: true,
		statusPlanningObligation: 'not_started',
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
		id: 1,
		organisationName: null,
		salutation: null,
		firstName: 'Bob',
		middleName: null,
		lastName: 'Ross',
		email: 'test8@example.com',
		website: null,
		phoneNumber: null,
		addressId: null
	},
	assignedTeam: {
		id: 1,
		email: 'temp@email.com',
		name: 'temp'
	},
	agent: {
		id: 2,
		organisationName: null,
		salutation: null,
		firstName: 'Fiona',
		middleName: null,
		lastName: 'Burgess',
		email: 'test6@example.com',
		website: null,
		phoneNumber: null,
		addressId: null
	},
	lpa: {
		id: 1,
		name: 'System Test Borough Council',
		lpaCode: 'Q9999',
		email: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
	},
	appealStatus: [
		{
			id: 2361,
			status: 'lpa_questionnaire',
			createdAt: new Date('2024-11-13T15:08:50.414Z'),
			valid: true,
			appealId: 1,
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
	completedStateList: ['assign_case_officer', 'validation', 'ready_to_start'],
	appealTimetable: {
		id: 1,
		appealId: 1,
		caseResubmissionDueDate: null,
		lpaQuestionnaireDueDate: new Date('2024-12-04T23:59:00.000Z'),
		ipCommentsDueDate: null,
		lpaStatementDueDate: null,
		finalCommentsDueDate: null,
		s106ObligationDueDate: null,
		issueDeterminationDate: null
	},
	appealType: {
		id: 1,
		type: 'Enforcement Notice',
		key: 'C',
		processCode: null,
		enabled: true
	},
	caseOfficer: {
		id: 1,
		azureAdUserId: '00000000-0000-0000-0000-000000000000'
	},
	inspector: null,
	inspectorDecision: null,
	lpaQuestionnaire: {
		id: 1,
		appealId: 1,
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
		isGreenBelt: true,
		affectsScheduledMonument: null,
		hasProtectedSpecies: null,
		isAonbNationalLandscape: null,
		designatedSitesNames: null,
		isGypsyOrTravellerSite: null,
		isPublicRightOfWay: null,
		eiaEnvironmentalImpactSchedule: null,
		eiaDevelopmentDescription: null,
		eiaSensitiveAreaDetails: null,
		eiaColumnTwoThreshold: null,
		eiaScreeningOpinion: null,
		eiaRequiresEnvironmentalStatement: null,
		eiaCompletedEnvironmentalStatement: null,
		consultedBodiesDetails: null,
		hasStatutoryConsultees: null,
		hasInfrastructureLevy: null,
		isInfrastructureLevyFormallyAdopted: null,
		infrastructureLevyAdoptedDate: null,
		infrastructureLevyExpectedDate: null,
		lpaProcedurePreference: null,
		lpaProcedurePreferenceDetails: null,
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
				lpaQuestionnaireId: 1,
				listEntry: '1264111',
				affectsListedBuilding: false
			},
			{
				id: 2,
				lpaQuestionnaireId: 1,
				listEntry: '1356956',
				affectsListedBuilding: false
			},
			{
				id: 3,
				lpaQuestionnaireId: 1,
				listEntry: '1202152',
				affectsListedBuilding: true
			},
			{
				id: 4,
				lpaQuestionnaireId: 1,
				listEntry: '1356318',
				affectsListedBuilding: true
			}
		],
		lpaNotificationMethods: [
			{
				notificationMethodId: 1,
				lpaQuestionnaireId: 1,
				lpaNotificationMethod: {
					id: 1,
					key: 'letter',
					name: 'Letter/email to interested parties'
				}
			},
			{
				notificationMethodId: 2,
				lpaQuestionnaireId: 1,
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
	representations: [],
	otherAppellants: [],
	appealGrounds: [
		{
			groundId: 1,
			appealId: 1,
			factsForGround: 'The site is in a conservation area',
			ground: {
				groundRef: 'a'
			}
		}
	]
};
