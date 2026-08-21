import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { beforeExpeditedOriginalApplicationCutOff } from '@pins/appeals/utils/appeal-type-checks.js';
import { checkDocument } from '@pins/appeals/utils/document-check.js';
export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: [
		'originalApplicationForm',
		'changedDescription',
		{
			key: 'appellantStatement',
			condition: (/** @type {{ applicationDate: string | null | undefined; }} */ data) =>
				beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
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
			key: 'plansDrawings',
			condition: (/** @type {{ applicationDate: string | null | undefined; }} */ data) =>
				beforeExpeditedOriginalApplicationCutOff(data.applicationDate)
		}
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
		'appellantApplicationFolder',
		{
			key: 'designAccessStatement',
			condition: (
				/** @type {{ documents: { designAccessStatement: string | null | undefined; } }} */ data
			) => checkDocument(data.documents.designAccessStatement)
		},
		{
			key: 'plansDrawings',
			condition: (
				/** @type {{ documents: { plansDrawings: string | null | undefined; } }} */ data
			) => checkDocument(data.documents.plansDrawings)
		},
		{
			key: 'newPlansDrawings',
			condition: (
				/** @type {{ documents: { newPlansDrawings: string | null | undefined; } }} */ data
			) => checkDocument(data.documents.newPlansDrawings)
		},
		{
			key: 'otherNewDocuments',
			condition: (
				/** @type {{ documents: { otherNewDocuments: string | null | undefined; } }} */ data
			) => checkDocument(data.documents.otherNewDocuments)
		}
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
