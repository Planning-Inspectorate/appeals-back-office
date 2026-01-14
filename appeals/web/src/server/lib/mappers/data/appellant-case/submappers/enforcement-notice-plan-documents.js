import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementNoticePlanDocuments = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			// @ts-ignore
			appellantCaseData.documents[APPEAL_DOCUMENT_TYPE.ENFORCEMENT_NOTICE_PLAN]?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'enforcment-notice-plan-documents',
		text: 'Enforcement notice plan',
		folderInfo:
			// @ts-ignore
			appellantCaseData.documents[APPEAL_DOCUMENT_TYPE.ENFORCEMENT_NOTICE_PLAN]
	});
