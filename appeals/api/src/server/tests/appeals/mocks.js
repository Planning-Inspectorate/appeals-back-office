import { APPEAL_TYPE_SHORTHAND_FPA, APPEAL_TYPE_SHORTHAND_HAS } from '#endpoints/constants.js';
import { STATUSES } from '@pins/appeals/constants/state.js';

import {
	azureAdUserId,
	validAppellantCaseOutcome,
	incompleteAppellantCaseOutcome,
	invalidAppellantCaseOutcome,
	completeLPAQuestionnaireOutcome,
	incompleteLPAQuestionnaireOutcome
} from '#tests/shared/mocks.js';

export const auditTrails = [
	{
		details: 'The case officer 13de469c-8de6-4908-97cd-330ea73df618 was added to the team',
		loggedAt: new Date().toISOString(),
		user: {
			azureAdUserId
		}
	},
	{
		details: 'Document blank.pdf uploaded (version 1)',
		loggedAt: new Date().toISOString(),
		user: {
			azureAdUserId
		}
	},
	{
		details: 'Version 1 of document blank.pdf received date changed',
		loggedAt: new Date().toISOString(),
		user: {
			azureAdUserId
		}
	},
	{
		details: 'Document blank.pdf (version 1) marked as redacted',
		loggedAt: new Date().toISOString(),
		user: {
			azureAdUserId
		}
	},
	{
		details: 'Document blank.pdf (version 1) marked as unredacted',
		loggedAt: new Date().toISOString(),
		user: {
			azureAdUserId
		}
	},
	{
		details: 'Document blank.pdf (version 1) marked as requiring no redaction',
		loggedAt: new Date().toISOString(),
		user: {
			azureAdUserId
		}
	}
];

export const householdAppeal = {
	id: 1,
	reference: '1345264',
	procedureType: {
		id: 1,
		key: 'written',
		name: 'Written'
	},
	neighbouringSites: [],
	appealStatus: [
		{
			status: STATUSES.ASSIGN_CASE_OFFICER,
			valid: true
		}
	],
	addressId: 1,
	lpa: {
		name: 'Maidstone Borough Council',
		lpaCode: 'MAID',
		id: 1,
		email: 'maid@lpa-email.gov.uk'
	},
	applicationReference: '48269/APP/2021/1482',
	appellant: {
		id: 1,
		firstName: 'Lee',
		lastName: 'Thornton',
		email: 'test@1367.com',
		phoneNumber: '01234 567 890',
		organisationName: 'Thornton LTD'
	},
	agent: {
		id: 1,
		firstName: 'John',
		lastName: 'Smith',
		email: 'test@136s7.com',
		phoneNumber: '09876 543 210',
		organisationName: 'Smith Inc.'
	},
	caseCreatedDate: new Date(2022, 4, 18),
	address: {
		addressLine1: '96 The Avenue',
		addressLine2: 'Leftfield',
		addressCountry: 'United Kingdom',
		addressCounty: 'Kent',
		id: 1,
		postcode: 'MD21 5XY',
		addressTown: 'Maidstone'
	},
	appealType: {
		id: 2,
		key: APPEAL_TYPE_SHORTHAND_HAS,
		processCode: 'HAS',
		type: 'Householder'
	},
	appellantCase: {
		appellantCaseIncompleteReasonsSelected: [],
		appellantCaseValidationOutcome: null,
		applicantFirstName: 'Fiona',
		applicantSurname: 'Burgess',
		areAllOwnersKnown: true,
		hasAdvertisedAppeal: true,
		hasAttemptedToIdentifyOwners: true,
		hasHealthAndSafetyIssues: true,
		hasNewSupportingDocuments: false,
		hasOtherTenants: null,
		hasToldOwners: true,
		hasToldTenants: null,
		siteAccessDetails: 'There is no mobile reception at the site',
		id: 1,
		isAgriculturalHolding: null,
		isAgriculturalHoldingTenant: null,
		isAppellantNamedOnApplication: false,
		isSiteFullyOwned: false,
		isSitePartiallyOwned: true,
		isSiteVisibleFromPublicRoad: false,
		doesSiteRequireInspectorAccess: true,
		siteSafetyDetails: 'Small dog big character',
		knowledgeOfOtherLandowners: {
			name: 'Some'
		},
		visibilityRestrictions: 'The site is behind a tall hedge'
	},
	caseOfficer: {
		id: 1,
		azureAdUserId: 'a8973f33-4d2e-486b-87b0-d068343ad9eb'
	},
	caseExtensionDate: '2023-08-10T01:00:00.000Z',
	inspector: {
		id: 2,
		azureAdUserId: 'e8f89175-d02c-4a60-870e-dc954d5b530a'
	},
	siteVisit: {
		id: 1,
		appealId: 1,
		visitDate: '2022-03-31T01:00:00.000Z',
		visitEndTime: '03:00',
		visitStartTime: '01:00',
		siteVisitType: {
			id: 1,
			name: 'Access required'
		}
	},
	linkedAppeals: [],
	otherAppeals: [],
	lpaQuestionnaire: {
		id: 1,
		appealId: 1,
		communityInfrastructureLevyAdoptionDate: null,
		developmentDescription: null,
		doesAffectAListedBuilding: null,
		doesAffectAScheduledMonument: null,
		doesSiteHaveHealthAndSafetyIssues: true,
		doesSiteRequireInspectorAccess: true,
		extraConditions: null,
		hasCommunityInfrastructureLevy: null,
		hasCompletedAnEnvironmentalStatement: null,
		hasEmergingPlan: null,
		hasExtraConditions: null,
		hasProtectedSpecies: null,
		hasRepresentationsFromOtherParties: null,
		hasResponsesOrStandingAdviceToUpload: null,
		hasStatementOfCase: null,
		hasStatutoryConsultees: null,
		hasSupplementaryPlanningDocuments: null,
		hasTreePreservationOrder: null,
		healthAndSafetyDetails: 'There may be no mobile reception at the site',
		inCAOrrelatesToCA: null,
		includesScreeningOption: null,
		inspectorAccessDetails:
			'There is a tall hedge around the site which obstructs the view of the site',
		isAffectingNeighbouringSites: true,
		isCommunityInfrastructureLevyFormallyAdopted: null,
		isConservationArea: true,
		isCorrectAppealType: true,
		isDevelopmentInOrNearDesignatedSites: null,
		isEnvironmentalStatementRequired: null,
		isGypsyOrTravellerSite: null,
		isListedBuilding: null,
		isPublicRightOfWay: null,
		isSensitiveArea: null,
		isSiteVisible: null,
		isTheSiteWithinAnAONB: null,
		listedBuildingDetails: [
			{
				listEntry: '1',
				affectsListedBuilding: false
			},
			{
				listEntry: '2',
				affectsListedBuilding: true
			}
		],
		lpaNotificationMethods: [
			{
				lpaNotificationMethod: {
					name: 'A site notice'
				}
			}
		],
		meetsOrExceedsThresholdOrCriteriaInColumn2: null,
		receivedAt: '2022-05-17T23:00:00.000Z',
		sentAt: '2023-05-24T10:34:09.286Z',
		siteWithinGreenBelt: null
	}
};

export const fullPlanningAppeal = {
	...householdAppeal,
	id: 2,
	appealType: {
		id: 1,
		key: APPEAL_TYPE_SHORTHAND_FPA,
		type: 'Full Planning'
	},
	appellantCase: {
		...householdAppeal.appellantCase,
		hasDesignAndAccessStatement: true,
		hasNewPlansOrDrawings: true,
		hasOtherTenants: true,
		hasPlanningObligation: true,
		hasSeparateOwnershipCertificate: true,
		hasToldTenants: false,
		isAgriculturalHolding: true,
		isAgriculturalHoldingTenant: true,
		isDevelopmentDescriptionStillCorrect: false,
		newDevelopmentDescription: 'A new extension has been added at the back',
	}
};

export const householdAppealAppellantCaseValid = {
	...householdAppeal,
	appellantCase: {
		...householdAppeal.appellantCase,
		...validAppellantCaseOutcome
	},
	id: 3
};

export const householdAppealAppellantCaseIncomplete = {
	...householdAppeal,
	appellantCase: {
		...householdAppeal.appellantCase,
		...incompleteAppellantCaseOutcome
	},
	id: 3,
	caseExtensionDate: '2099-07-14T01:00:00.000Z'
};

export const householdAppealAppellantCaseInvalid = {
	...householdAppeal,
	appellantCase: {
		...householdAppeal.appellantCase,
		...invalidAppellantCaseOutcome
	},
	id: 4
};

export const householdAppealLPAQuestionnaireComplete = {
	...householdAppeal,
	lpaQuestionnaire: {
		...householdAppeal.lpaQuestionnaire,
		...completeLPAQuestionnaireOutcome
	},
	id: 3
};

export const householdAppealLPAQuestionnaireIncomplete = {
	...householdAppeal,
	lpaQuestionnaire: {
		...householdAppeal.lpaQuestionnaire,
		...incompleteLPAQuestionnaireOutcome
	},
	id: 3
};

export const fullPlanningAppealAppellantCaseIncomplete = {
	...fullPlanningAppeal,
	appellantCase: {
		...fullPlanningAppeal.appellantCase,
		...incompleteAppellantCaseOutcome
	},
	id: 5
};

export const fullPlanningAppealAppellantCaseInvalid = {
	...fullPlanningAppeal,
	appellantCase: {
		...fullPlanningAppeal.appellantCase,
		...invalidAppellantCaseOutcome
	},
	id: 6
};

export const fullPlanningAppealLPAQuestionnaireIncomplete = {
	...fullPlanningAppeal,
	lpaQuestionnaire: {
		...fullPlanningAppeal.lpaQuestionnaire,
		...incompleteLPAQuestionnaireOutcome
	},
	id: 5
};

export const linkedAppeals = [
	{
		parentId: householdAppeal.id,
		parentRef: householdAppeal.reference,
		childRef: '76215416',
		linkingDate: '2024-01-01',
		appealType: householdAppeal.appealType,
		relationshipId: 1,
		type: 'linked',
		externalSource: true
	}
];

export const serviceUser = {
	id: 1,
	organisationName: 'Fury LTD',
	firstName: 'Nick',
	middleName: null,
	lastName: 'Fury',
	email: 'nick.fury@mail.com',
	website: null,
	phoneNumber: null,
	addressId: null
};
