import { actionsHtml, documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSupportingDocuments = ({ appealDetails, currentRoute }) => {
	const id = 'supporting-documents';
	const folderInfo = appealDetails.supportingDocuments;
	const folderId = folderInfo?.folderId;
	const documentCount =
		folderInfo?.documents?.filter((document) => !document.latestDocumentVersion?.isDeleted)
			.length ?? 0;
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
		text: 'Supporting documents',
		statusText,
		receivedText: 'Not applicable',
		actionHtml: folderId
			? actionsHtml({
					id,
					text: 'Supporting documents',
					hasDocuments,
					link: `${currentRoute}/${id}`,
					editable: true,
					folderId
				})
			: '',
		actionHtmlClasses: 'govuk-!-width-one-quarter'
	});
};
