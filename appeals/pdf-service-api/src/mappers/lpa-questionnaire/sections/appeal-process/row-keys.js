import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { beforeExpeditedOriginalApplicationCutOff } from '@pins/appeals/utils/appeal-type-checks.js';
export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: [
		{
			key: 'anySignificantChangesLpa',
			condition: (data) => !beforeExpeditedOriginalApplicationCutOff(data?.applicationDate)
		},
		'otherAppeals',
		'hasExtraConditions'
	],
	[APPEAL_TYPE.CAS_PLANNING]: ['otherAppeals', 'hasExtraConditions'],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: [
		'lpaProcedurePreference',
		'lpaProcedurePreferenceDetails',
		'lpaProcedurePreferenceDuration',
		'otherAppeals',
		'hasExtraConditions',
		{
			key: 'anySignificantChangesLpa',
			condition: (data) => !beforeExpeditedOriginalApplicationCutOff(data?.applicationDate)
		}
	],
	[APPEAL_TYPE.ADVERTISEMENT]: [
		'lpaProcedurePreference',
		'lpaProcedurePreferenceDetails',
		'lpaProcedurePreferenceDuration',
		'otherAppeals',
		'hasExtraConditions'
	],
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: [
		'lpaProcedurePreference',
		'lpaProcedurePreferenceDetails',
		'lpaProcedurePreferenceDuration',
		'otherAppeals',
		'hasExtraConditions'
	],
	[APPEAL_TYPE.S78]: [
		'lpaProcedurePreference',
		'lpaProcedurePreferenceDetails',
		'lpaProcedurePreferenceDuration',
		'otherAppeals',
		'hasExtraConditions'
	],
	[APPEAL_TYPE.S78_EXPEDITED]: [
		'lpaProcedurePreference',
		'lpaProcedurePreferenceDetails',
		'lpaProcedurePreferenceDuration',
		'anySignificantChangesLpa',
		'otherAppeals',
		'hasExtraConditions'
	],
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		'lpaProcedurePreference',
		'lpaProcedurePreferenceDetails',
		'lpaProcedurePreferenceDuration',
		'otherAppeals'
	]
};
