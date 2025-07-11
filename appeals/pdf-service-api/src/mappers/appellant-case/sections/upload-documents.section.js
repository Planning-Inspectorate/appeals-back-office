import { formatDocumentData, formatSentenceCase } from '../../../lib/nunjucks-filters/index.js';

export function uploadDocumentsSection(templateData) {
	const { planningObligation } = templateData;

	const {
		originalApplicationForm,
		changedDescription,
		applicationDecisionLetter,
		appellantStatement,
		planningObligation: planningObligationDocuments,
		ownershipCertificate,
		appellantCostsApplication,
		designAccessStatement,
		plansDrawings,
		newPlansDrawings,
		otherNewDocuments
	} = templateData.documents || {};

	return {
		heading: 'Upload documents',
		items: [
			{
				key: 'Application form',
				html: formatDocumentData(originalApplicationForm)
			},
			{
				key: 'Agreement to change the description of development',
				html: formatDocumentData(changedDescription)
			},
			{
				key: 'Decision letter from the local planning authority',
				html: formatDocumentData(applicationDecisionLetter)
			},
			{ key: 'Appellant statement', html: formatDocumentData(appellantStatement) },
			{
				key: 'What is the status of your planning obligation?',
				text: formatSentenceCase(planningObligation?.status, 'Not answered')
			},
			{ key: 'Planning obligation', html: formatDocumentData(planningObligationDocuments) },
			{
				key: 'Separate ownership certificate and agricultural land declaration',
				html: formatDocumentData(ownershipCertificate)
			},
			{
				key: 'Application for an award of appeal costs',
				html: formatDocumentData(appellantCostsApplication)
			},
			{ key: 'Design and access statement', html: formatDocumentData(designAccessStatement) },
			{ key: 'Plans, drawings and list of plans', html: formatDocumentData(plansDrawings) },
			{ key: 'New plans or drawings', html: formatDocumentData(newPlansDrawings) },
			{ key: 'Other new supporting documents', html: formatDocumentData(otherNewDocuments) }
		]
	};
}
