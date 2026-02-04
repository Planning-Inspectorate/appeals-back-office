import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCostsDocument = ({ appellantCaseData, appealDetails, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appealDetails.costs.appellantApplicationFolder?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'costs-appellant',
		text: 'Application for an award of appeal costs',
		folderInfo: appealDetails.costs.appellantApplicationFolder,
		cypressDataName: 'costs-document'
	});
