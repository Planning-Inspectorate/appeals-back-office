import standardFilters from 'nunjucks/src/filters.js';
import { formatDate } from '../../lib/nunjucks-filters/format-date.js';
import { formatDocumentData, formatSentenceCase } from '../../lib/nunjucks-filters/index.js';
const { nl2br, safe } = standardFilters;

export function mapLpaFinalComments(templateData) {
	const { originalRepresentation, created, status, attachments } = templateData;
	return {
		details: templateData,
		heading: 'LPA final comments',
		dateReceived: created ? formatDate(created, 'd MMMM yyyy, HH:mm') : 'N/A',
		status: formatSentenceCase(status),
		sections: [
			{
				heading: 'Submitted final comments',
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
