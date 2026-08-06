import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { actionsHtml, documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnvironmentalAssessment = (data) => {
	const { currentRoute, appealDetails } = data;
	const { eiaScreeningRequired, environmentalAssessment } = appealDetails;
	const screeningOpinionIndicatesEiaRequired =
		data.appellantCase?.screeningOpinionIndicatesEiaRequired;

	const id = 'environmental-assessment';

	if (
		!environmentalAssessment ||
		(!eiaScreeningRequired && !screeningOpinionIndicatesEiaRequired)
	) {
		return { id, display: {} };
	}

	const documents = environmentalAssessment?.documents.filter(
		(doc) => !doc.latestDocumentVersion?.isDeleted
	);

	const latestReceivedDocument = documents?.reduce(
		(latestReceivedDocument, currentDocument) => {
			if (!latestReceivedDocument) {
				return currentDocument;
			}

			return latestReceivedDocument?.createdAt > currentDocument.createdAt
				? latestReceivedDocument
				: currentDocument;
		},
		{ createdAt: '' }
	);

	const text = 'Environmental services team review';

	return documentationFolderTableItem({
		id,
		text,
		statusText: environmentalAssessment.documentCount
			? `${environmentalAssessment.documentCount} document${environmentalAssessment.documentCount === 1 ? '' : 's'}`
			: 'No documents',
		receivedText:
			documents?.length && latestReceivedDocument?.createdAt
				? dateISOStringToDisplayDate(latestReceivedDocument.createdAt)
				: 'Not applicable',
		actionHtml: actionsHtml({
			id,
			text,
			hasDocuments: !!documents?.length,
			link: `${currentRoute}/${id}`,
			editable: true,
			folderId: environmentalAssessment?.folderId
		}),
		actionHtmlClasses: 'govuk-!-width-one-quarter'
	});
};
