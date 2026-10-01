import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

const commonBeforeYouStartRows = [
	'localPlanningAuthority',
	'typeOfApplication',
	'applicationDecision',
	'applicationDecisionDate',
	'appellantCostsAppliedFor',
	'applicationReferenceNumber'
];

export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: commonBeforeYouStartRows,
	[APPEAL_TYPE.CAS_PLANNING]: commonBeforeYouStartRows,
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: commonBeforeYouStartRows,
	[APPEAL_TYPE.ADVERTISEMENT]: commonBeforeYouStartRows,
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: commonBeforeYouStartRows,
	[APPEAL_TYPE.S78]: commonBeforeYouStartRows,
	[APPEAL_TYPE.S78_EXPEDITED]: commonBeforeYouStartRows,
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		'localPlanningAuthority',
		'typeOfApplication',
		'applicationDecision',
		'applicationDecisionDate',
		'applicationReferenceNumber'
	]
};
