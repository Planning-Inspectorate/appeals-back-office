import { formatDocumentData, formatYesNo } from '../../../../lib/nunjucks-filters/index.js';

export const rowBuilders = {
	didSubmitDesignAccessStatementLPA: (data) => ({
		key: 'Did the applicant submit a design and access statement with their application?',
		html: formatYesNo(!!data.documents?.designAccessStatementLPA?.documents?.length)
	}),

	designAccessStatementLPA: (data) => ({
		key: 'Design and access statement',
		html: formatDocumentData(data.documents?.designAccessStatementLPA)
	}),

	didSubmitPlansDrawingsLPA: (data) => ({
		key: 'Did the applicant submit plans and drawings with the application?',
		html: formatYesNo(!!data.documents?.plansDrawingsLPA?.documents?.length)
	}),

	plansDrawingsLPA: (data) => ({
		key: 'Plans and drawings',
		html: formatDocumentData(data.documents?.plansDrawingsLPA)
	}),

	didSubmitAdditionalDocumentsLPA: (data) => ({
		key: 'Did the applicant submit any other documents with the application?',
		html: formatYesNo(!!data.documents?.additionalDocumentsLPA?.documents?.length)
	}),

	additionalDocumentsLPA: (data) => ({
		key: 'Any other documents submitted with the application',
		html: formatDocumentData(data.documents?.additionalDocumentsLPA)
	}),

	listOfDocumentsBeforeDecision: (data) => ({
		key: 'What documents and plans did you use to make your decision?',
		text: data.listOfDocumentsBeforeDecision || 'Not provided'
	})
};
