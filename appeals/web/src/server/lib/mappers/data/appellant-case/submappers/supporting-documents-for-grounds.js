import {
	documentUploadUrlTemplate,
	mapDocumentManageUrl
} from '#lib/mappers/data/appellant-case/common.js';
import { documentSummaryListItem } from '#lib/mappers/index.js';
import { GROUND_SUPPORTING_DOCTYPE } from '@pins/appeals/constants/documents.js';

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
		const docType = GROUND_SUPPORTING_DOCTYPE[groundRef.toUpperCase()];
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
