import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { beforeExpeditedOriginalApplicationCutOff } from '@pins/appeals/utils/appeal-type-checks.js';

export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: [
		'applicationDate',
		'developmentDescription',
		'otherAppealsList',
		'applicationDecisionLetter',
		{
			key: 'reasonForAppealAppellant',
			condition: (data) => !beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
		}
	],
	[APPEAL_TYPE.CAS_PLANNING]: [
		'applicationDate',
		'developmentDescription',
		'otherAppealsList',
		'applicationDecisionLetter'
	],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: [
		'applicationDate',
		'developmentDescription',
		'changedDescription',
		'otherAppealsList',
		'applicationDecisionLetter'
	],
	[APPEAL_TYPE.ADVERTISEMENT]: [
		'applicationDate',
		'developmentDescription',
		'changedDescription',
		'otherAppealsList',
		'applicationDecisionLetter'
	],
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: [
		'applicationDate',
		'developmentDescription',
		'otherAppealsList',
		'developmentType'
	],
	[APPEAL_TYPE.S78]: [
		'applicationDate',
		'developmentDescription',
		'otherAppealsList',
		'developmentType'
	],
	[APPEAL_TYPE.S78_EXPEDITED]: [
		'applicationDate',
		'developmentDescription',
		'otherAppealsList',
		'developmentType'
	],
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		'applicationDate',
		'siteUseAtTimeOfApplication',
		'applicationMadeUnderActSection',
		'developmentDescription',
		'changedDescription',
		'otherAppealsList'
	]
};
