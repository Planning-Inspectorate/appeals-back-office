import { formatDocumentData, formatSentenceCase } from '../../../../lib/nunjucks-filters/index.js';

export const rowBuilders = {
	originalApplicationForm: (data) => ({
		key: 'Application form',
		html: formatDocumentData(data.documents.originalApplicationForm)
	}),
	changedDescription: (data) => ({
		key: 'Agreement to change the description of development',
		html: formatDocumentData(data.documents.changedDescription)
	}),
	applicationDecisionLetter: (data) => ({
		key: 'Decision letter from the local planning authority',
		html: formatDocumentData(data.documents.applicationDecisionLetter)
	}),
	appellantStatement: (data) => ({
		key: 'Appeal statement',
		html: formatDocumentData(data.documents.appellantStatement)
	}),
	planningObligationStatus: (data) => ({
		key: 'What is the status of your planning obligation?',
		text: formatSentenceCase(data.planningObligation?.status, 'Not answered')
	}),
	planningObligation: (data) => ({
		key: 'Planning obligation',
		html: formatDocumentData(data.documents.planningObligationDocuments)
	}),
	statementCommonGround: (data) => ({
		key: 'Draft statement of common ground',
		html: formatDocumentData(data.documents.statementCommonGround)
	}),
	ownershipCertificate: (data) => ({
		key: 'Separate ownership certificate and agricultural land declaration',
		html: formatDocumentData(data.documents.ownershipCertificate)
	}),
	appellantApplicationFolder: (data) => ({
		key: 'Application for an award of appeal costs',
		html: formatDocumentData(data.documents.appellantApplicationFolder)
	}),
	designAccessStatement: (data) => ({
		key: 'Design and access statement',
		html: formatDocumentData(data.documents.designAccessStatement)
	}),
	plansDrawings: (data) => ({
		key: 'Plans, drawings and list of plans',
		html: formatDocumentData(data.documents.plansDrawings)
	}),
	newPlansDrawings: (data) => ({
		key: 'New plans or drawings',
		html: formatDocumentData(data.documents.newPlansDrawings)
	}),
	otherNewDocuments: (data) => ({
		key: 'Other new supporting documents',
		html: formatDocumentData(data.documents.otherNewDocuments)
	})
};
