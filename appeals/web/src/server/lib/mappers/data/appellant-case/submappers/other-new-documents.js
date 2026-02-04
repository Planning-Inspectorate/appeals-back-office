import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapOtherNewDocuments = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.otherNewDocuments?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'new-supporting-documents',
		text: 'Other new supporting documents',
		folderInfo: appellantCaseData.documents.otherNewDocuments
	});
