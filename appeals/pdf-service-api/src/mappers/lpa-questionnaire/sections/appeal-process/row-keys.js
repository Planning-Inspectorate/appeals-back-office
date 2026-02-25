import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: ['otherAppeals', 'hasExtraConditions'],
	[APPEAL_TYPE.CAS_PLANNING]: ['otherAppeals', 'hasExtraConditions'],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: [
		'lpaProcedurePreference',
		'lpaProcedurePreferenceDetails',
		'lpaProcedurePreferenceDuration',
		'otherAppeals',
		'hasExtraConditions'
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
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		'lpaProcedurePreference',
		'lpaProcedurePreferenceDetails',
		'lpaProcedurePreferenceDuration',
		'otherAppeals'
	]
};
