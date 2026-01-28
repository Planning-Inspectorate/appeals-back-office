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
export const changeOfUseRefuseOrWastePage = (
	appealData,
	lpaQuestionnaireData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const currentRadioValue =
		storedSessionData?.radio ?? lpaQuestionnaireData.changeOfUseRefuseOrWaste;

	/** @type {PageContent} */
	const pageContent = {
		title: `Does the enforcement notice include a change of use of land to dispose refuse or waste materials?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'changeOfUseRefuseOrWasteRadio',
				value: currentRadioValue,
				legendText: `Does the enforcement notice include a change of use of land to dispose refuse or waste materials?`,
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};
