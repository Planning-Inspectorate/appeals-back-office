import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').SingleLPAQuestionnaireResponse} LPAQuestionnaire
 */
/**
 * @param {Appeal} appealData
 * @param {LPAQuestionnaire} lpaQuestionnaireData
 * @param {{radio: string, details: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeCorrectAppealTypePage = (
	appealData,
	lpaQuestionnaireData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const currentRadioValue = storedSessionData?.radio ?? lpaQuestionnaireData.isCorrectAppealType;

	/** @type {PageContent} */
	const pageContent = {
		title: `Change the LPA response to "Is the appeal type correct"?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Is the appeal type correct (LPA response)?`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'correctAppealTypeRadio',
					id: 'correct-appeal-type-radio',
					fieldSet: {
						legend: {
							text: `Is the appeal type correct (LPA response)?`,
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'yes',
							text: 'Yes',
							checked: currentRadioValue
						},
						{
							value: 'no',
							text: 'No',
							checked: !currentRadioValue
						}
					]
				}
			}
		]
	};

	return pageContent;
};
