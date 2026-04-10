import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnvironmentalStatement = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.environmentalAssessment?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'environmental-statement',
		text: 'Environmental statement',
		folderInfo: appellantCaseData.documents.environmentalAssessment
	});
