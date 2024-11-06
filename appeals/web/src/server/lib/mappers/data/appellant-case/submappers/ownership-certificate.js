import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapOwnershipCertificate = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.ownershipCertificate?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'ownership-certificate',
		text: 'Ownership certificate or land declaration',
		folderInfo: appellantCaseData.documents.ownershipCertificate
	});
