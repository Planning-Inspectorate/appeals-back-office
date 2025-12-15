import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { GROUNDS_APPLICATION_RECEIPT_DOCTYPE } from '@pins/appeals/constants/documents.js';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationReceipt = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			// @ts-ignore
			appellantCaseData.documents[GROUNDS_APPLICATION_RECEIPT_DOCTYPE]?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'application-receipt',
		text: 'Application receipt',
		// @ts-ignore
		folderInfo: appellantCaseData.documents[GROUNDS_APPLICATION_RECEIPT_DOCTYPE]
	});
