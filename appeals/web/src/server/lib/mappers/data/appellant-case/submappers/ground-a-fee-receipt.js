import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapGroundAFeeReceipt = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			// @ts-ignore
			appellantCaseData.documents[APPEAL_DOCUMENT_TYPE.GROUND_A_FEE_RECEIPT]?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'ground-a-fee-receipt',
		text: 'Ground (a) fee receipt',
		// @ts-ignore
		folderInfo: appellantCaseData.documents[APPEAL_DOCUMENT_TYPE.GROUND_A_FEE_RECEIPT]
	});
