import {
	APPEAL_TYPE_SHORTHAND_FPA,
	APPEAL_TYPE_SHORTHAND_HAS
} from '@pins/appeals/constants/support.js';
import has from './has.js';
import s78 from './s78.js';
import s20 from './s20.js';

import {
	azureAdUserId,
	validAppellantCaseOutcome,
	incompleteAppellantCaseOutcome,
	invalidAppellantCaseOutcome,
	completeLPAQuestionnaireOutcome,
	incompleteLPAQuestionnaireOutcome
} from '#tests/shared/mocks.js';
import { APPEAL_CASE_STATUS, APPEAL_TYPE_OF_PLANNING_APPLICATION } from 'pins-data-model';

export const auditTrails = [
	{
		details: 'The case officer 13de469c-8de6-4908-97cd-330ea73df618 was added to the team',
		loggedAt: new Date('2024-03-25T23:59:59.999Z').toISOString(),
		user: {
			azureAdUserId
		}
	},
	{
		details: 'Document blank.pdf uploaded (version 1)',
		loggedAt: new Date('2024-03-25T23:59:59.999Z').toISOString(),
		user: {
			azureAdUserId
		}
	},
	{
		details: 'Version 1 of document blank.pdf received date changed',
		loggedAt: new Date('2024-03-25T23:59:59.999Z').toISOString(),
		user: {
			azureAdUserId
		}
	},
	{
		details: 'Document blank.pdf (version 1) marked as redacted',
		loggedAt: new Date('2024-03-25T23:59:59.999Z').toISOString(),
		user: {
			azureAdUserId
		}
	},
	{
		details: 'Document blank.pdf (version 1) marked as unredacted',
		loggedAt: new Date('2024-03-25T23:59:59.999Z').toISOString(),
		user: {
			azureAdUserId
		}
	},
	{
		details: 'Document blank.pdf (version 1) marked as requiring no redaction',
		loggedAt: new Date('2024-03-25T23:59:59.999Z').toISOString(),
		user: {
			azureAdUserId
		}
	}
];

export const caseNotes = [
	{
		id: 1,
		comment: 'Comment 1',
		createdAt: new Date('2024-03-25T23:59:59.999Z').toISOString(),
		user: {
			azureAdUserId
		}
	},
	{
		id: 2,
		comment: 'Document received by email',
		createdAt: new Date('2024-03-26T23:59:59.999Z').toISOString(),
		user: {
			azureAdUserId
		}
	}
];

export const appealHas = {
	...has
};

export const appealS78 = {
	...s78
};

export const appealS20 = {
	...s20
};

export const householdAppeal = {
	caseCreatedDate: new Date('2024-03-25T23:59:59.999Z'),
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
			status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
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
		id: 1,
		appellantCaseIncompleteReasonsSelected: [],
		appellantCaseValidationOutcome: null,
		appellantCostsAppliedFor: null,
		applicationDate: new Date(2022, 2, 18),
		applicationDecision: 'refused',
		applicationDecisionDate: new Date(2022, 2, 18),
		caseSubmissionDueDate: new Date(2022, 2, 18),
		caseSubmittedDate: new Date(2022, 2, 18),
		changedDevelopmentDescription: false,
		enforcementNotice: null,
		floorSpaceSquareMetres: null,
		hasAdvertisedAppeal: true,
		knowsAllOwners: null,
		knowsOtherOwners: null,
		originalDevelopmentDescription: 'A test description',
		ownersInformed: true,
		ownsAllLand: true,
		ownsSomeLand: true,
		siteAccessDetails: 'There is no mobile reception at the site',
		siteSafetyDetails: 'Small dog big character',
		siteAreaSquareMetres: '100',
		appellantProcedurePreference: 'Hearing',
		appellantProcedurePreferenceDetails: 'Reason for preference',
		appellantProcedurePreferenceDuration: 5,
		appellantProcedurePreferenceWitnessCount: 1,
		typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.HOUSEHOLDER_PLANNING
	},
	caseOfficer: {
		id: 1,
		azureAdUserId: 'a8973f33-4d2e-486b-87b0-d068343ad9eb'
	},
	inspector: {
		id: 2,
		azureAdUserId: 'e8f89175-d02c-4a60-870e-dc954d5b530a'
	},
	siteVisit: {
		id: 1,
		appealId: 1,
		visitDate: new Date('2022-03-31T01:00:00.000Z'),
		visitEndTime: new Date('2022-03-31T03:00:00.000Z'),
		visitStartTime: new Date('2022-03-31T01:00:00.000Z'),
		siteVisitType: {
			id: 1,
			name: 'Access required',
			key: 'site_visit_access_required'
		}
	},
	hearing: {
		id: 1,
		appealId: 1,
		hearingStartTime: new Date('2022-03-31T01:00:00.000Z'),
		hearingEndTime: new Date('2022-03-31T03:00:00.000Z'),
		addressId: 1,
		address: {
			id: 1,
			addressLine1: '96 The Avenue',
			addressLine2: 'Leftfield',
			addressCountry: 'United Kingdom',
			addressCounty: 'Kent',
			postcode: 'MD21 5XY',
			addressTown: 'Maidstone'
		}
	},
	parentAppeals: [],
	childAppeals: [],
	lpaQuestionnaire: {
		id: 1,
		appealId: 1,
		siteSafetyDetails: 'There may be no mobile reception at the site',
		siteAccessDetails: 'There is a tall hedge around the site which obstructs the view of the site',
		inConservationArea: true,
		isCorrectAppealType: true,
		lpaStatement: null,
		newConditionDetails: null,
		lpaCostsAppliedFor: false,
		siteWithinGreenBelt: null,
		listedBuildingDetails: [
			{
				id: 1,
				listEntry: '1',
				affectsListedBuilding: false
			},
			{
				id: 2,
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
		lpaqCreatedDate: new Date(2024, 5, 24),
		lpaQuestionnaireSubmittedDate: new Date(2024, 5, 24)
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
		typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
	},
	representations: []
};

export const listedBuildingAppeal = {
	...fullPlanningAppeal,
	id: 3,
	appealType: {
		id: 12,
		type: 'Planning listed building and conservation area',
		key: 'Y'
	},
	representations: []
};

export const listedBuildingAppealAppellantCaseValid = {
	...fullPlanningAppeal,
	id: 3,
	appealType: {
		id: 12,
		type: 'Planning listed building and conservation area',
		key: 'Y'
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
		typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL,
		...validAppellantCaseOutcome
	},
	representations: []
};
export const listedBuildingAppealAppellantCaseIncomplete = {
	...fullPlanningAppeal,
	id: 3,
	appealType: {
		id: 12,
		type: 'Planning listed building and conservation area',
		key: 'Y'
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
		typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL,
		...incompleteAppellantCaseOutcome
	},
	representations: []
};

export const listedBuildingAppealAppellantCaseInvalid = {
	...fullPlanningAppeal,
	id: 3,
	appealType: {
		id: 12,
		type: 'Planning listed building and conservation area',
		key: 'Y'
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
		typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL,
		...invalidAppellantCaseOutcome
	},
	representations: []
};

export const fullPlanningAppealCaseValid = {
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
		typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL,
		...validAppellantCaseOutcome
	},
	representations: []
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
	caseExtensionDate: new Date(2099, 6, 14)
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
	appealStatus: [
		{
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			valid: true
		}
	],
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
		child: {
			appealType: {
				key: 'Z',
				type: 'Another appeal type'
			}
		},
		linkingDate: new Date(2024, 1, 1),
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
