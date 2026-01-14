import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementNoticeDocuments = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			// @ts-ignore
			appellantCaseData.documents[APPEAL_DOCUMENT_TYPE.ENFORCEMENT_NOTICE]?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'enforcment-notice-documents',
		text: 'Enforcement notice',
		folderInfo:
			// @ts-ignore
			appellantCaseData.documents[APPEAL_DOCUMENT_TYPE.ENFORCEMENT_NOTICE]
	});
