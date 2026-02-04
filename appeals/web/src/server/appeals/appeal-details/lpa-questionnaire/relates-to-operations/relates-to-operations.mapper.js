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
export const changeRelatesToOperationsPage = (
	appealData,
	lpaQuestionnaireData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const currentRadioValue =
		storedSessionData?.radio ?? lpaQuestionnaireData.noticeRelatesToBuildingEngineeringMiningOther;

	/** @type {PageContent} */
	const pageContent = {
		title: `Does the enforcement notice relate to building, engineering, mining or other operations?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'relatesToOperationsRadio',
				value: currentRadioValue,
				legendText: `Does the enforcement notice relate to building, engineering, mining or other operations?`,
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};
