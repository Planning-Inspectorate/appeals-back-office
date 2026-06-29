import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { beforeExpeditedOriginalApplicationCutOff } from '@pins/appeals/utils/appeal-type-checks.js';
export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: [
		'originalApplicationForm',
		'changedDescription',
		{
			key: 'appellantStatement',
			condition: (data) => beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
		},
		'appellantApplicationFolder'
	],
	[APPEAL_TYPE.CAS_PLANNING]: [
		'originalApplicationForm',
		'changedDescription',
		{
			key: 'reasonForAppealAppellant',
			condition: (/** @type {{ applicationDate: string | null | undefined; }} */ data) =>
				!beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
		},
		{
			key: 'appellantStatement',
			condition: (/** @type {{ applicationDate: string | null | undefined; }} */ data) =>
				beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
		},
		'appellantApplicationFolder',
		{
			key: 'designAccessStatement',
			condition: (/** @type {{ applicationDate: string | null | undefined; }} */ data) =>
				beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
		},
		{
			key: 'plansDrawings',
			condition: (/** @type {{ applicationDate: string | null | undefined; }} */ data) =>
				beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
		}
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
	[APPEAL_TYPE.S78_EXPEDITED]: [
		'originalApplicationForm',
		'didYouSubmitEnvironmentalStatement',
		'environmentalStatement',
		'changedDevelopmentDescription',
		'changedDescription',
		'applicationDecisionLetter',
		'planningObligation',
		'ownershipCertificate',
		'appellantApplicationFolder'
	],
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		'originalApplicationForm',
		'appellantStatement',
		'appellantApplicationFolder',
		'plansDrawings',
		'statementCommonGround',
		'newPlansDrawings',
		'applicationDecisionLetter',
		'otherNewDocuments'
	]
};
