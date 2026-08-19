import { actionsHtml, documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapInquiryEventDocuments = ({ appealDetails, currentRoute }) => {
	const id = 'inquiry-event-documents';
	const folderInfo = appealDetails.inquiryEventDocuments;
	const folderId = folderInfo?.folderId;
	const documentCount = folderInfo?.documentCount ?? 0;
	const hasDocuments = documentCount > 0;
	let statusText = 'No documents';

	if (hasDocuments) {
		if (documentCount === 1) {
			statusText = '1 document';
		} else {
			statusText = `${documentCount} documents`;
		}
	}

	return documentationFolderTableItem({
		id,
		text: 'Inquiry event documents',
		statusText,
		receivedText: 'Not applicable',
		actionHtml: actionsHtml({
			id,
			text: 'Inquiry event documents',
			hasDocuments,
			link: `${currentRoute}/${id}`,
			editable: true,
			folderId
		}),
		actionHtmlClasses: 'govuk-!-width-one-quarter'
	});
};
