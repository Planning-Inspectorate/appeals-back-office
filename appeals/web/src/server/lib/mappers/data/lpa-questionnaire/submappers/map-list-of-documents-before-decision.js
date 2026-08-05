import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapListOfDocumentsBeforeDecision = ({ lpaQuestionnaireData, currentRoute }) =>
	textSummaryListItem({
		id: 'list-of-documents-before-decision',
		text: 'What documents and plans did you use to make your decision?',
		editable: true,
		value: lpaQuestionnaireData.listOfDocumentsBeforeDecision || 'Not provided',
		link: `${currentRoute}/list-of-documents-before-decision/change`,
		cypressDataName: 'change-list-of-documents-before-decision',
		withShowMore: true
	});
