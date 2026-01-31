import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

//TODO: update with new document type
/** @type {import('../mapper.js').SubMapper} */
export const mapChangedDevelopmentDescriptionDocument = ({
	appellantCaseData,
	userHasUpdateCase
}) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.changedDescription?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'changed-development-description.document',
		text: 'Agreement to change the description of development',
		folderInfo: appellantCaseData.documents.changedDescription,
		cypressDataName: 'agreement-to-change-description-evidence'
	});
