import { documentationFolderTableItem, listItemLink } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnvironmentalImpactAssessment = (data) => {
	const { currentRoute } = data;
	// TODO: work out how to get folder info
	const folderInfo = {
		folderId: 1234,
		documents: [{ latestDocumentVersion: { isDeleted: false } }]
	};
	const id = 'environmental-impact-assessment';
	const link = `${currentRoute}/${id}`;
	const documents = folderInfo.documents.filter((doc) => !doc.latestDocumentVersion?.isDeleted);
	const folderId = folderInfo?.folderId;

	let actionsHtmls = `<ul class="govuk-summary-list__actions-list">`;

	if (documents) {
		actionsHtmls += listItemLink(link + '/manage-documents/' + folderId, 'Manage');
	}

	actionsHtmls += listItemLink(link + '/upload-documents/' + folderId, 'Add', 'add-' + id);

	actionsHtmls += `</ul>`;

	return documentationFolderTableItem({
		id: 'environmental-impact-assessment',
		text: 'Environmental impact assessment',
		statusText: documents?.length
			? `${documents?.length} document${documents?.length === 1 ? '' : 's'}`
			: 'No documents',
		receivedText: '',
		actionHtml: actionsHtmls
	});
};
