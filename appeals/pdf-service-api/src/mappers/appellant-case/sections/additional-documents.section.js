import { formatDocumentData } from '../../../lib/nunjucks-filters/index.js';

export function additionalDocumentsSection(templateData) {
	const { appellantCaseCorrespondence } = templateData.documents || {};

	return {
		heading: 'Additional documents',
		items: [
			{
				key: '',
				html: formatDocumentData(appellantCaseCorrespondence)
			}
		]
	};
}
