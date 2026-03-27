import { formatDocumentData, formatYesNoDetails } from '../../../../lib/nunjucks-filters/index.js';

export const rowBuilders = {
	otherPartyRepresentations: (data) => ({
		key: 'Representations from members of the public or other parties',
		html: formatDocumentData(data.documents.otherPartyRepresentations)
	}),

	consultationResponses: (data) => ({
		key: 'Consultation responses and standing advice',
		html: formatDocumentData(data.documents.consultationResponses)
	}),

	consultedBodiesDetails: (data) => ({
		key: 'Did you consult all the relevant statutory consultees about the development?',
		html: formatYesNoDetails(data.consultedBodiesDetails)
	})
};
