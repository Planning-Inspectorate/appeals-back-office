/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { textareaInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} lpaQuestionnaireData
 * @param {{textarea: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeListDocumentsBeforeDecisionPage = (
	appealData,
	lpaQuestionnaireData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let listDocumentsBeforeDecision = lpaQuestionnaireData.listOfDocumentsBeforeDecision;

	if (storedSessionData?.textarea) {
		listDocumentsBeforeDecision = storedSessionData.textarea;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: 'What documents and plans did you use to make your decision?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${lpaQuestionnaireData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			textareaInput({
				name: 'listDocumentsBeforeDecisionTextarea',
				id: 'list-documents-before-decision',
				labelText: 'What documents and plans did you use to make your decision?',
				labelIsPageHeading: true,
				value: listDocumentsBeforeDecision || ''
			})
		]
	};

	return pageContent;
};
