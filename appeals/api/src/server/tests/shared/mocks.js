import {
	VALIDATION_OUTCOME_COMPLETE,
	VALIDATION_OUTCOME_INCOMPLETE,
	VALIDATION_OUTCOME_INVALID,
	VALIDATION_OUTCOME_VALID
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

const lookupListData = [
	{
		id: 1,
		name: 'Value 1',
		key: APPEAL_CASE_TYPE.D
	},
	{
		id: 2,
		name: 'Value 2',
		key: APPEAL_CASE_TYPE.ZA
	},
	{
		id: 3,
		name: 'Other',
		key: APPEAL_CASE_TYPE.W
	}
];

export const auditTrails = lookupListData;
export const appellantCaseIncompleteReasons = lookupListData;
export const appellantCaseInvalidReasons = lookupListData;
export const appellantCaseEnforcementInvalidReasons = lookupListData;
export const lpaQuestionnaireIncompleteReasons = lookupListData;
export const knowledgeOfOtherLandowners = lookupListData;
export const lpaNotificationMethods = lookupListData;
export const lpaDesignatedSites = lookupListData;
export const lpas = lookupListData;
export const planningObligationStatuses = lookupListData;
export const appealTypes = lookupListData;
export const procedureTypes = lookupListData;
export const scheduleTypes = lookupListData;
export const siteVisitTypes = lookupListData;
export const documentRedactionStatuses = lookupListData;
export const documentRedactionStatusIds = documentRedactionStatuses.map(({ id }) => id);
export const azureAdUserId = '6f930ec9-7f6f-448c-bb50-b3b898035959';
export const representationRejectionReasons = lookupListData;

export const designatedSites = [
	{
		description: 'Site 1',
		id: 1,
		name: 'Site 1'
	},
	{
		description: 'Site 2',
		id: 2,
		name: 'Site 2'
	}
];

export const appellantCaseValidationOutcomes = [
	{
		id: 1,
		name: VALIDATION_OUTCOME_INCOMPLETE
	},
	{
		id: 2,
		name: VALIDATION_OUTCOME_INVALID
	},
	{
		id: 3,
		name: VALIDATION_OUTCOME_VALID
	}
];

export const lpaQuestionnaireValidationOutcomes = [
	{
		id: 1,
		name: VALIDATION_OUTCOME_COMPLETE
	},
	{
		id: 2,
		name: VALIDATION_OUTCOME_INCOMPLETE
	}
];

export const validAppellantCaseOutcome = {
	appellantCaseValidationOutcome: {
		name: 'Valid'
	}
};

export const incompleteAppellantCaseOutcome = {
	appellantCaseIncompleteReasonsSelected: [
		{
			appellantCaseIncompleteReason: {
				name: 'The original application form is incomplete'
			},
			appellantCaseIncompleteReasonText: []
		},
		{
			appellantCaseIncompleteReason: {
				name: 'Other'
			},
			appellantCaseIncompleteReasonText: [
				{
					text: 'Appellant contact information is incorrect or missing'
				}
			]
		}
	],
	appellantCaseValidationOutcome: {
		name: 'Incomplete'
	}
};

export const invalidAppellantCaseOutcome = {
	appellantCaseInvalidReasonsSelected: [
		{
			appellantCaseInvalidReason: {
				name: 'Appeal has not been submitted on time'
			},
			appellantCaseInvalidReasonText: []
		},
		{
			appellantCaseInvalidReason: {
				name: 'Other'
			},
			appellantCaseInvalidReasonText: [
				{
					text: 'The appeal site address does not match'
				}
			]
		}
	],
	appellantCaseValidationOutcome: {
		name: 'Invalid'
	}
};

export const completeLPAQuestionnaireOutcome = {
	lpaQuestionnaireValidationOutcome: {
		name: 'Complete'
	}
};

export const incompleteLPAQuestionnaireOutcome = {
	lpaQuestionnaireIncompleteReasonsSelected: [
		{
			lpaQuestionnaireIncompleteReason: {
				name: 'Documents or information are missing'
			},
			lpaQuestionnaireIncompleteReasonText: [
				{
					text: 'Policy is missing'
				}
			]
		},
		{
			lpaQuestionnaireIncompleteReason: {
				name: 'Other'
			},
			lpaQuestionnaireIncompleteReasonText: [
				{
					text: 'Addresses are incorrect or missing'
				}
			]
		}
	],
	lpaQuestionnaireValidationOutcome: {
		name: 'Incomplete'
	}
};

export const grounds = [
	{
		id: 1,
		groundRef: 'a',
		groundDescription: 'Ground A'
	},
	{
		id: 2,
		groundRef: 'b',
		groundDescription: 'Ground B'
	},
	{
		id: 3,
		groundRef: 'c',
		groundDescription: 'Ground C'
	}
];
