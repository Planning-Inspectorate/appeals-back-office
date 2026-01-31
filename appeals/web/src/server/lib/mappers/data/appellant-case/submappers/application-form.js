import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationForm = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.originalApplicationForm?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'application-form',
		text: 'Application form',
		folderInfo: appellantCaseData.documents.originalApplicationForm
	});
