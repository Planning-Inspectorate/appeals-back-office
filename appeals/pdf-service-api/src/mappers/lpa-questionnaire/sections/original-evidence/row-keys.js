import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

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
	]
};
