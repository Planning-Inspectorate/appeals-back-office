import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

//TODO: update with new document type
/** @type {import('../mapper.js').SubMapper} */
export const mapChangedAdvertisementDescriptionDocument = ({
	appellantCaseData,
	userHasUpdateCase
}) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.changedDescription?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'changed-advertisement-description.document',
		text: 'Agreement to change the description of the advertisement',
		folderInfo: appellantCaseData.documents.changedDescription,
		cypressDataName: 'agreement-to-change-description-evidence'
	});
