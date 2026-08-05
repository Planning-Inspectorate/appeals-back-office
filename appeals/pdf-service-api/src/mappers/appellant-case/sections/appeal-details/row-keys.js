import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { beforeExpeditedOriginalApplicationCutOff } from '@pins/appeals/utils/appeal-type-checks.js';

export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: [
		{
			key: 'reasonForAppealAppellant',
			condition: (/** @type {{ applicationDate: string | null | undefined; }} */ data) =>
				!beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
		}
	],
	[APPEAL_TYPE.CAS_PLANNING]: [
		{
			key: 'reasonForAppealAppellant',
			condition: (/** @type {{ applicationDate: string | null | undefined; }} */ data) =>
				!beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
		}
	],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: [
		{
			key: 'reasonForAppealAppellant',
			condition: (/** @type {{ applicationDate: string | null | undefined; }} */ data) =>
				!beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
		}
	],
	[APPEAL_TYPE.ADVERTISEMENT]: [
		'appellantProcedurePreference',
		'appellantProcedurePreferenceDetails',
		'appellantProcedurePreferenceDuration',
		'appellantProcedurePreferenceWitnessCount'
	],
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: [
		'appellantProcedurePreference',
		'appellantProcedurePreferenceDetails',
		'appellantProcedurePreferenceDuration',
		'appellantProcedurePreferenceWitnessCount'
	],
	[APPEAL_TYPE.S78]: [
		'appellantProcedurePreference',
		'appellantProcedurePreferenceDetails',
		'appellantProcedurePreferenceDuration',
		'appellantProcedurePreferenceWitnessCount'
	],
	[APPEAL_TYPE.S78_EXPEDITED]: ['reasonForAppealAppellant'],
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		'appellantProcedurePreference',
		'appellantProcedurePreferenceDetails',
		'appellantProcedurePreferenceDuration',
		'appellantProcedurePreferenceWitnessCount'
	]
};
