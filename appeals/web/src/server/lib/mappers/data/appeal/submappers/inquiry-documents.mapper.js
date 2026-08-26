import { actionsHtml, documentationFolderTableItem } from '#lib/mappers/index.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

/** @type {import('../mapper.js').SubMapper} */
export const mapInquiryDocuments = ({ appealDetails, currentRoute }) => {
	const documentCount = appealDetails?.inquiryDocuments?.documentCount ?? 0;
	const hasDocuments = documentCount > 0;
	const hasMultipleDocuments = documentCount > 1;
	const statusText = hasDocuments
		? hasMultipleDocuments
			? `${documentCount} documents`
			: '1 document'
		: 'No documents';

	const receivedText = 'Not applicable';

	const actionHtml = actionsHtml({
		id: 'inquiry-documents',
		link: `${currentRoute}/inquiry/documents`,
		hasDocuments,
		editable: true,
		folderId: appealDetails?.inquiryDocuments?.folderId,
		text: 'Inquiry documents'
	});

	return documentationFolderTableItem({
		id: 'inquiry-documents',
		text: 'Inquiry documents',
		statusText,
		receivedText,
		actionHtml
	});
};
