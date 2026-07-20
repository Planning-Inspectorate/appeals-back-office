import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { beforeExpeditedOriginalApplicationCutOff } from '@pins/appeals/utils/appeal-type-checks.js';

export const rowKeys = {
	[APPEAL_TYPE.S78_EXPEDITED]: [
		'didSubmitDesignAccessStatementLPA',
		'designAccessStatementLPA',
		'didSubmitPlansDrawingsLPA',
		'plansDrawingsLPA',
		'didSubmitAdditionalDocumentsLPA',
		'additionalDocumentsLPA',
		'listOfDocumentsBeforeDecision'
	],
	[APPEAL_TYPE.S78]: [
		'didSubmitDesignAccessStatementLPA',
		'designAccessStatementLPA',
		'didSubmitPlansDrawingsLPA',
		'plansDrawingsLPA',
		'didSubmitAdditionalDocumentsLPA',
		'additionalDocumentsLPA',
		'listOfDocumentsBeforeDecision'
	],
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: [
		'didSubmitDesignAccessStatementLPA',
		'designAccessStatementLPA',
		'didSubmitPlansDrawingsLPA',
		'plansDrawingsLPA',
		'didSubmitAdditionalDocumentsLPA',
		'additionalDocumentsLPA',
		'listOfDocumentsBeforeDecision'
	],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: [
		{
			key: 'didSubmitDesignAccessStatementLPA',
			condition: (data) => !beforeExpeditedOriginalApplicationCutOff(data?.applicationDate)
		},
		{
			key: 'designAccessStatementLPA',
			condition: (data) => !beforeExpeditedOriginalApplicationCutOff(data?.applicationDate)
		},
		{
			key: 'didSubmitPlansDrawingsLPA',
			condition: (data) => !beforeExpeditedOriginalApplicationCutOff(data?.applicationDate)
		},
		{
			key: 'plansDrawingsLPA',
			condition: (data) => !beforeExpeditedOriginalApplicationCutOff(data?.applicationDate)
		},
		{
			key: 'didSubmitAdditionalDocumentsLPA',
			condition: (data) => !beforeExpeditedOriginalApplicationCutOff(data?.applicationDate)
		},
		{
			key: 'additionalDocumentsLPA',
			condition: (data) => !beforeExpeditedOriginalApplicationCutOff(data?.applicationDate)
		},
		{
			key: 'listOfDocumentsBeforeDecision',
			condition: (data) => !beforeExpeditedOriginalApplicationCutOff(data?.applicationDate)
		}
	]
};
