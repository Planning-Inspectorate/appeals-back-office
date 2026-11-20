import { submaps as s78Submaps } from './s78.js';
import { mapGenericDocumentFolder } from './submappers/generic-document-folder.mapper.js';

/** @type {Record<string, import('./mapper.js').SubMapper>} */
export const submaps = {
	...s78Submaps,
	appellantCase: ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
		mapGenericDocumentFolder({
			id: 'appellant-case',
			text: 'Appeal',
			folderInfo:
				'appellantCaseFolder' in appealDetails ? appealDetails.appellantCaseFolder : undefined,
			currentRoute,
			userHasUpdateCasePermission
		}),
	lpaQuestionnaire: ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
		mapGenericDocumentFolder({
			id: 'lpa-questionnaire',
			text: 'LPA questionnaire',
			folderInfo:
				'lpaQuestionnaireFolder' in appealDetails
					? appealDetails.lpaQuestionnaireFolder
					: undefined,
			currentRoute,
			userHasUpdateCasePermission
		})
};
