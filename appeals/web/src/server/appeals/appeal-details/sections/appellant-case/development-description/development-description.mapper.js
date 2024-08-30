/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {string} storedSessionData
 * @returns {PageContent}
 */
export const changeDevelopmentDescriptionPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Change development description`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change development description`,
		pageComponents: [
			{
				type: 'character-count',
				parameters: {
					name: 'developmentDescription',
					id: 'development-description',
					maxlength: 1000,
					label: {
						text: 'Enter the original description of the development',
						isPageHeading: false
					},
					value: storedSessionData ?? appellantCaseData.developmentDescription?.details ?? ''
				}
			}
		]
	};

	return pageContent;
};
