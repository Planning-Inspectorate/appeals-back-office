import {
	documentUploadUrlTemplate,
	mapDocumentManageUrl
} from '#lib/mappers/data/appellant-case/common.js';
import { documentSummaryListItem } from '#lib/mappers/index.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapperList} */
export const mapSupportingDocumentsForGrounds = ({ appellantCaseData, userHasUpdateCase }) => {
	// @ts-ignore
	const { appealGrounds } = appellantCaseData;

	if (!appealGrounds) {
		return [];
	}

	// @ts-ignore
	return appealGrounds.map((appealGround) => {
		const { ground } = appealGround || {};
		const { groundRef = '' } = ground || {};
		const id = `supporting-documents-for-ground-${groundRef}`;
		// @ts-ignore
		const docType = APPEAL_DOCUMENT_TYPE[`GROUND_${groundRef.toUpperCase()}_SUPPORTING`];
		return documentSummaryListItem({
			manageUrl: mapDocumentManageUrl(
				appellantCaseData.appealId,
				// @ts-ignore
				appellantCaseData.documents[docType]?.folderId
			),
			appealId: appellantCaseData.appealId,
			editable: userHasUpdateCase,
			uploadUrlTemplate: documentUploadUrlTemplate,
			id,
			text: `Ground (${groundRef}) supporting documents`,
			// @ts-ignore
			folderInfo: appellantCaseData.documents[docType]
		});
	});
};
