import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { actionsHtml, documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnvironmentalAssessment = (data) => {
	const { currentRoute, appealDetails } = data;
	const { eiaScreeningRequired, environmentalAssessment } = appealDetails;

	const id = 'environmental-assessment';

	if (!eiaScreeningRequired || !environmentalAssessment) {
		return { id, display: {} };
	}

	const documents = environmentalAssessment.documents.filter(
		(doc) => !doc.latestDocumentVersion?.isDeleted
	);

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

	const text = 'Environmental services team review';

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
			link: `${currentRoute}/${id}`,
			editable: true,
			folderId: environmentalAssessment.folderId
		}),
		actionHtmlClasses: 'govuk-!-width-one-quarter'
	});
};
