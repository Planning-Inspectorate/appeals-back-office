import { formatDocumentData, formatYesNoDetails } from '../../../lib/nunjucks-filters/index.js';

export function consultationResponsesAndRepresentationsSection(templateData) {
	const { consultedBodiesDetails } = templateData;

	const { otherPartyRepresentations, consultationResponses } = templateData.documents || {};

	return {
		heading: 'Consultation responses and representations',
		items: [
			{
				key: 'Representations from members of the public or other parties',
				html: formatDocumentData(otherPartyRepresentations)
			},
			{
				key: 'Consultation responses and standing advice',
				html: formatDocumentData(consultationResponses)
			},
			{
				key: 'Did you consult all the relevant statutory consultees about the development?',
				html: formatYesNoDetails(consultedBodiesDetails)
			}
		]
	};
}
