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
export const changeSiteUseAtTimeOfApplicationPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What did you use the appeal site for when you made the application?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `What did you use the appeal site for when you made the application?`,
		pageComponents: [
			{
				type: 'character-count',
				parameters: {
					name: 'siteUseAtTimeOfApplication',
					id: 'site-use-at-time-of-application',
					maxlength: 1000,
					label: {
						text: 'What did you use the appeal site for when you made the application?'
					},
					value: storedSessionData ?? appellantCaseData?.siteUseAtTimeOfApplication ?? ''
				}
			}
		]
	};

	return pageContent;
};
