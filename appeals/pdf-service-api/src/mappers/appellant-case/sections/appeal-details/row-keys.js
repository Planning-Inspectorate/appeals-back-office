import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { appealTypeToAppealCaseTypeMapper } from '@pins/appeals/utils/appeal-type-case.mapper.js';
import {
	beforeExpeditedOriginalApplicationCutOff,
	isExpeditedAppealType
} from '@pins/appeals/utils/appeal-type-checks.js';

const isExpeditedAppealCondition = (/** @type {{ appealType: string; }} */ data) =>
	isExpeditedAppealType(appealTypeToAppealCaseTypeMapper(data.appealType)) ||
	data.appealType === APPEAL_TYPE.S78_EXPEDITED;

export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: [
		{
			key: 'appellantProcedurePreference',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDetails',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDuration',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceWitnessCount',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		}
	],
	[APPEAL_TYPE.CAS_PLANNING]: [
		{
			key: 'reasonForAppealAppellant',
			condition: (/** @type {{ applicationDate: string | null | undefined; }} */ data) =>
				!beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
		},
		{
			key: 'appellantProcedurePreference',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDetails',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDuration',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceWitnessCount',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		}
	],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: [
		{
			key: 'appellantProcedurePreference',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDetails',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDuration',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceWitnessCount',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		}
	],
	[APPEAL_TYPE.ADVERTISEMENT]: [
		{
			key: 'appellantProcedurePreference',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDetails',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDuration',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceWitnessCount',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		}
	],
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: [
		{
			key: 'appellantProcedurePreference',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDetails',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDuration',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceWitnessCount',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		}
	],
	[APPEAL_TYPE.S78]: [
		{
			key: 'appellantProcedurePreference',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDetails',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDuration',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceWitnessCount',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		}
	],
	[APPEAL_TYPE.S78_EXPEDITED]: ['reasonForAppealAppellant'],
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		{
			key: 'appellantProcedurePreference',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDetails',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceDuration',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		},
		{
			key: 'appellantProcedurePreferenceWitnessCount',
			condition: (/** @type {{ appealType: string; }} */ data) => !isExpeditedAppealCondition(data)
		}
	]
};
