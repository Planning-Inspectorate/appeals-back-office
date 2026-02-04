import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} LPAQuestionnaire
 */

/**
 * @param {Appeal} appealData
 * @param {LPAQuestionnaire} lpaQuestionnaireData
 * @param {string} storedSessionData
 * @returns {PageContent}
 */
export const changeSiteAreaPage = (appealData, lpaQuestionnaireData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const siteArea = storedSessionData ?? lpaQuestionnaireData?.siteAreaSquareMetres;

	/** @type {PageContent} */
	const pageContent = {
		title: 'What is the area of the appeal site?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'What is the area of the appeal site?',
		pageComponents: [
			{
				type: 'input',
				parameters: {
					name: 'siteArea',
					id: 'site-area',
					label: {
						text: 'Site area in square metres '
					},
					classes: 'govuk-input--width-10',
					value: siteArea || '',
					suffix: {
						text: 'm²'
					}
				}
			}
		]
	};
	return pageContent;
};
