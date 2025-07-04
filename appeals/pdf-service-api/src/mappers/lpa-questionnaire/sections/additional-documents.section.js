import { formatDocumentData } from '../../../lib/nunjucks-filters/index.js';

export function additionalDocumentsSection(templateData) {
	const { lpaCaseCorrespondence } = templateData.lpaQuestionnaireData?.documents || {};

	return {
		heading: 'Additional documents (LPA case correspondence)',
		items: [
			{
				key: 'Additional documents',
				html: formatDocumentData(lpaCaseCorrespondence)
			}
		]
	};
}
