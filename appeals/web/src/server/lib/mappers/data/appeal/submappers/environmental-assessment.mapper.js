import { documentationFolderTableItem, listItemLink } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnvironmentalAssessment = (data) => {
	const { currentRoute, appealDetails } = data;
	const { environmentalAssessment } = appealDetails;
	const id = 'environmental-assessment';
	const link = `${currentRoute}/documentation/${id}`;
	const documents = environmentalAssessment?.documents.filter(
		(doc) => !doc.latestDocumentVersion?.isDeleted
	);
	const folderId = environmentalAssessment?.folderId;

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
