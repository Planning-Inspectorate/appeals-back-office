import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { formatDocumentData, formatSentenceCase } from '../../../lib/nunjucks-filters/index.js';

export function uploadDocumentsSection(templateData) {
	const { planningObligation, appealType } = templateData;

	const {
		originalApplicationForm,
		changedDescription,
		applicationDecisionLetter,
		appellantStatement,
		planningObligation: planningObligationDocuments,
		ownershipCertificate,
		statementCommonGround,
		designAccessStatement,
		plansDrawings,
		newPlansDrawings,
		otherNewDocuments
	} = templateData.documents || {};

	const { appellantApplicationFolder } = templateData.costs || {};

	const isHASAppeal = appealType === APPEAL_TYPE.HOUSEHOLDER;

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
			// Will not appear for householder - appears in application details
			...(!isHASAppeal
				? [
						{
							key: 'Decision letter from the local planning authority',
							html: formatDocumentData(applicationDecisionLetter)
						}
					]
				: []),
			{ key: 'Appellant statement', html: formatDocumentData(appellantStatement) },
			// Will not appear for householder
			...(!isHASAppeal
				? [
						{
							key: 'What is the status of your planning obligation?',
							text: formatSentenceCase(planningObligation?.status, 'Not answered')
						},
						{ key: 'Planning obligation', html: formatDocumentData(planningObligationDocuments) }
					]
				: []),
			{ key: 'Draft statement of common ground', html: formatDocumentData(statementCommonGround) },
			// Will not appear for householder
			...(!isHASAppeal
				? [
						{
							key: 'Separate ownership certificate and agricultural land declaration',
							html: formatDocumentData(ownershipCertificate)
						}
					]
				: []),
			{
				key: 'Application for an award of appeal costs',
				html: formatDocumentData(appellantApplicationFolder)
			},
			// Will not appear for householder
			...(!isHASAppeal
				? [
						{ key: 'Design and access statement', html: formatDocumentData(designAccessStatement) },
						{ key: 'Plans, drawings and list of plans', html: formatDocumentData(plansDrawings) },
						{ key: 'New plans or drawings', html: formatDocumentData(newPlansDrawings) },
						{ key: 'Other new supporting documents', html: formatDocumentData(otherNewDocuments) }
					]
				: [])
		]
	};
}
