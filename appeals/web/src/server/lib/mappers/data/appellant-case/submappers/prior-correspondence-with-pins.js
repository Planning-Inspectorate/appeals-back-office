import { documentSummaryListItem } from '#lib/mappers/components/index.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import { documentUploadUrlTemplate, mapDocumentManageUrl } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapPriorCorrespondenceWithPINS = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			// @ts-ignore
			appellantCaseData.documents[APPEAL_DOCUMENT_TYPE.PRIOR_CORRESPONDENCE_WITH_PINS]?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'communication-with-pins-documents',
		text: 'Communication with the Planning Inspectorate',
		folderInfo:
			// @ts-ignore
			appellantCaseData.documents[APPEAL_DOCUMENT_TYPE.PRIOR_CORRESPONDENCE_WITH_PINS]
	});
