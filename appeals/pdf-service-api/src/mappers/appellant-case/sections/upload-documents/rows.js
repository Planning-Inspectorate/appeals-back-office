import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { formatDocumentData, formatSentenceCase } from '../../../../lib/nunjucks-filters/index.js';

/** @type {Record<string, (data: any) => any>} */
export const rowBuilders = {
	originalApplicationForm: (data) => ({
		key: 'Application form',
		html: formatDocumentData(data.documents.originalApplicationForm)
	}),
	didYouSubmitEnvironmentalStatement: (data) => ({
		key:
			data.appealType === APPEAL_TYPE.S78_EXPEDITED
				? 'Did you submit an environmental statement with the application?'
				: 'Did you submit an environmental statement with your application?',
		text:
			data.screeningOpinionIndicatesEiaRequired == null
				? 'Not answered'
				: formatSentenceCase(data.screeningOpinionIndicatesEiaRequired ? 'Yes' : 'No')
	}),
	environmentalStatement: (data) => ({
		key:
			data.appealType === APPEAL_TYPE.S78_EXPEDITED
				? 'Upload your environmental statement'
				: 'Environmental statement',
		html: formatDocumentData(data.documents.eiaEnvironmentalStatementAppellant)
	}),
	changedDevelopmentDescription: (data) => ({
		key: 'Did the local planning authority change the description of development?',
		text: data.developmentDescription?.isChanged === true ? 'Yes' : 'No'
	}),
	changedDescription: (data) => ({
		key: 'Agreement to change the description of development',
		html: formatDocumentData(data.documents.changedDescription)
	}),
	reasonForAppealAppellant: (data) => ({
		key: 'Why are you appealing?',
		text: formatSentenceCase(data.reasonForAppealAppellant, 'Not provided')
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
