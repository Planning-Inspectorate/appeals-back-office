import { documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnvironmentalImpactAssessment = () => {
	return documentationFolderTableItem({
		id: 'environmental-impact-assessment',
		text: 'Environmental impact assessment',
		statusText: 'Yaba daba doo',
		receivedText: 'No documents',
		actionHtml: ''
	});
};
