import { actionsHtml, documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapHearingDocuments = ({ appealDetails, currentRoute }) => {
	const id = 'hearing-documents';
	const folderInfo = appealDetails.hearingDocuments;
	const folderId = folderInfo?.folderId;
	const documentCount = folderInfo?.documentCount ?? 0;
	const hasDocuments = documentCount > 0;
	const statusText = hasDocuments
		? documentCount > 1
			? `${documentCount} documents`
			: '1 document'
		: 'No documents';

	return documentationFolderTableItem({
		id,
		text: 'Hearing documents',
		statusText,
		receivedText: 'Not applicable',
		actionHtml: actionsHtml({
			id,
			text: 'Hearing documents',
			hasDocuments,
			link: `${currentRoute}/${id}`,
			editable: true,
			folderId
		}),
		actionHtmlClasses: 'govuk-!-width-one-quarter'
	});
};
