import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: [
		'originalApplicationForm',
		'changedDescription',
		'appellantStatement',
		'appellantApplicationFolder'
	],
	[APPEAL_TYPE.CAS_PLANNING]: [
		'originalApplicationForm',
		'changedDescription',
		'appellantStatement',
		'appellantApplicationFolder',
		'designAccessStatement',
		'plansDrawings'
	],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: [
		'originalApplicationForm',
		'appellantStatement',
		'appellantApplicationFolder',
		'plansDrawings'
	],
	[APPEAL_TYPE.ADVERTISEMENT]: [
		'originalApplicationForm',
		'appellantStatement',
		'appellantApplicationFolder',
		'plansDrawings'
	],
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: [
		'originalApplicationForm',
		'changedDescription',
		'applicationDecisionLetter',
		'appellantStatement',
		'planningObligationStatus',
		'planningObligation',
		'statementCommonGround',
		'ownershipCertificate',
		'appellantApplicationFolder',
		'designAccessStatement',
		'plansDrawings',
		'newPlansDrawings',
		'otherNewDocuments'
	],
	[APPEAL_TYPE.S78]: [
		'originalApplicationForm',
		'changedDescription',
		'applicationDecisionLetter',
		'appellantStatement',
		'planningObligationStatus',
		'planningObligation',
		'statementCommonGround',
		'ownershipCertificate',
		'appellantApplicationFolder',
		'designAccessStatement',
		'plansDrawings',
		'newPlansDrawings',
		'otherNewDocuments'
	],
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		'originalApplicationForm',
		'appellantStatement',
		'appellantApplicationFolder',
		'plansDrawings',
		'planningObligationStatus',
		'planningObligation',
		'statementCommonGround',
		'newPlansDrawings',
		'applicationDecisionLetter',
		'otherNewDocuments'
	]
};
