import { actionsHtml, documentationFolderTableItem } from '#lib/mappers/index.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';

/** @type {import('../mapper.js').RowMapper} */
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

	const latestReceivedDocument = documents.reduce(
		(latestReceivedDocument, currentDocument) => {
			if (!latestReceivedDocument) {
				return currentDocument;
			}
			return latestReceivedDocument?.latestDocumentVersion?.dateReceived >
				currentDocument.latestDocumentVersion?.dateReceived
				? latestReceivedDocument
				: currentDocument;
		},
		{ latestDocumentVersion: { dateReceived: '' } }
	);

	return documentationFolderTableItem({
		id,
		text,
		statusText: documents.length
			? `${documents.length} document${documents.length === 1 ? '' : 's'}`
			: 'No documents',
		receivedText: documents.length
			? dateISOStringToDisplayDate(latestReceivedDocument.latestDocumentVersion.dateReceived)
			: 'Not applicable',
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
