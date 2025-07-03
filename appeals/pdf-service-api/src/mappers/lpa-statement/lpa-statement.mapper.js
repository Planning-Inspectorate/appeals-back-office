import { formatDate } from '../../lib/nunjucks-filters/format-date.js';
import { formatDocumentData, formatSentenceCase } from '../../lib/nunjucks-filters/index.js';
import standardFilters from 'nunjucks/src/filters.js';
const { nl2br, safe } = standardFilters;

export function mapLpaStatement(templateData) {
	const { originalRepresentation, created, status, attachments } = templateData;
	return {
		details: templateData,
		heading: 'LPA statement',
		dateReceived: created ? formatDate(created, 'd MMMM yyyy, HH:mm') : 'N/A',
		status: formatSentenceCase(status),
		sections: [
			{
				heading: 'Statement',
				details: safe(nl2br(originalRepresentation || 'No comment provided'))
			},
			{
				heading: 'Supporting documents',
				details: formatDocumentData({
					documents: attachments.map((attachment) => ({
						name: attachment.documentVersion.fileName
					}))
				})
			}
		]
	};
}
