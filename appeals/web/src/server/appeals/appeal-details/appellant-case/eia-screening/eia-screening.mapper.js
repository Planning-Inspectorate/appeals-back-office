import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {any} appealDetails
 * @param {any} appellantCaseData
 * @param {any} sessionEiaScreening
 * @returns {PageContent}
 */
export const changeEiaScreeningPage = (appealDetails, appellantCaseData, sessionEiaScreening) => {
	const screeningOpinionIndicatesEiaRequired =
		sessionEiaScreening?.radio ?? appellantCaseData.screeningOpinionIndicatesEiaRequired;

	/** @type {PageContent} */
	const pageContent = {
		title: 'Did you submit an environmental statement with the application?',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case`,
		heading: 'Did you submit an environmental statement with the application?',
		submitButtonText: 'Continue',
		pageComponents: [
			yesNoInput({
				name: 'eiaScreeningRadio',
				value: screeningOpinionIndicatesEiaRequired,
				legendText: 'Did you submit an environmental statement with the application?',
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};
