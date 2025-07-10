import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

//TODO: update with new document type
/** @type {import('../mapper.js').SubMapper} */
export const mapStatementOfCommonGroundDocument = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.statementOfCommonGround?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'draft-statement-of-common-ground.document',
		text: 'Draft statement of common ground',
		folderInfo: appellantCaseData.documents.statementOfCommonGround,
		cypressDataName: 'draft-statement-of-common-ground'
	});
