import { appealShortReference } from '#lib/appeals-formatter.js';
import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
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
export const changeAreaOfAllegedBreachInSquareMetresPage = (
	appealData,
	lpaQuestionnaireData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const currentRadioValue = storedSessionData?.radio
		? convertFromYesNoToBoolean(storedSessionData?.radio)
		: !lpaQuestionnaireData.areaOfAllegedBreachInSquareMetres;

	const currentDetailsValue =
		storedSessionData?.details ?? lpaQuestionnaireData.areaOfAllegedBreachInSquareMetres ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: `Is the area of the alleged breach the same as the site area?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'areaOfAllegedBreachInSquareMetresRadio',
				value: currentRadioValue,
				legendText: `Is the area of the alleged breach the same as the site area?`,
				legendIsPageHeading: true,
				noConditional: {
					id: 'area-of-alleged-breach-details',
					name: 'areaOfAllegedBreachInSquareMetres',
					hint: 'Area of the alleged breach, in square metres',
					details: currentDetailsValue
				}
			})
		]
	};

	return pageContent;
};
