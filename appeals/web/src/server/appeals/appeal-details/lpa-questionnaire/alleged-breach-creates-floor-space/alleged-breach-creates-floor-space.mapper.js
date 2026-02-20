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
export const changeFloorSpaceCreatedByBreachInSquareMetresPage = (
	appealData,
	lpaQuestionnaireData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const currentRadioValue = storedSessionData?.radio
		? convertFromYesNoToBoolean(storedSessionData?.radio)
		: !!lpaQuestionnaireData.floorSpaceCreatedByBreachInSquareMetres;

	const currentDetailsValue =
		storedSessionData?.details ??
		lpaQuestionnaireData.floorSpaceCreatedByBreachInSquareMetres ??
		'';

	/** @type {PageContent} */
	const pageContent = {
		title: `Does the alleged breach create any floor space?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'floorSpaceCreatedByBreachInSquareMetresRadio',
				value: currentRadioValue,
				legendText: `Does the alleged breach create any floor space?`,
				legendIsPageHeading: true,
				yesConditional: {
					id: 'floor-space-created-details',
					name: 'floorSpaceCreatedByBreachInSquareMetres',
					hint: 'Floor space created by the breach, in square metres',
					details: currentDetailsValue
				}
			})
		]
	};

	return pageContent;
};
