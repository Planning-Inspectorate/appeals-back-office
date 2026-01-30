import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} LPAQuestionnaire
 */
/**
 * @param {Appeal} appealData
 * @param {LPAQuestionnaire} lpaQuestionnaireData
 * @param {{radio: string, details: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeIsOnCrownLandPage = (appealData, lpaQuestionnaireData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const currentRadioValue = storedSessionData?.radio ?? lpaQuestionnaireData.isSiteOnCrownLand;

	/** @type {PageContent} */
	const pageContent = {
		title: `Is the appeal site on Crown land?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'isOnCrownLandRadio',
				value: currentRadioValue,
				legendText: `Is the appeal site on Crown land?`,
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};
