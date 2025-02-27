import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapCostsDocument = ({ appellantCaseData, appealDetails, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appealDetails.costs.appellantApplicationFolder?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'costs-appellant',
		text: 'Costs application',
		folderInfo: appealDetails.costs.appellantApplicationFolder,
		cypressDataName: 'costs-document'
	});
