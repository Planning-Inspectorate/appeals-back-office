import { actionsHtml, documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnvironmentalAssessment = (data) => {
	const { currentRoute, appealDetails } = data;
	const id = 'environmental-assessment';
	const { eiaScreeningRequired, environmentalAssessment } = appealDetails;
	if (!eiaScreeningRequired || !environmentalAssessment) {
		return { id, display: {} };
	}
	const link = `${currentRoute}/${id}`;
	const documents = environmentalAssessment.documents.filter(
		(doc) => !doc.latestDocumentVersion?.isDeleted
	);
	const text = 'Environmental assessment';

	return documentationFolderTableItem({
		id,
		text,
		statusText: documents.length
			? `${documents.length} document${documents.length === 1 ? '' : 's'}`
			: 'No documents',
		receivedText: '',
		actionHtml: actionsHtml({
			id,
			text,
			hasDocuments: !!documents.length,
			link,
			editable: true,
			folderId: environmentalAssessment.folderId
		})
	});
};
