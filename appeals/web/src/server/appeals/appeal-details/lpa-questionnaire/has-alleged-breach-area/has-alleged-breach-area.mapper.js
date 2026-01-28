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
export const changeHasAllegedBreachAreaPage = (
	appealData,
	lpaQuestionnaireData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const currentRadioValue = storedSessionData?.radio ?? lpaQuestionnaireData.hasAllegedBreachArea;

	/** @type {PageContent} */
	const pageContent = {
		title: `Is the area of the alleged breach the same as the site area?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'hasAllegedBreachAreaRadio',
				value: currentRadioValue,
				legendText: `Is the area of the alleged breach the same as the site area?`,
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};
