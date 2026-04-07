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
export const reasonForAppealPage = (appealData, appellantCaseData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Why are you appealing?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Why are you appealing?`,
		pageComponents: [
			{
				type: 'character-count',
				parameters: {
					name: 'reasonForAppealAppellant',
					id: 'reasonForAppealAppellant',
					maxlength: 1000,
					value: storedSessionData ?? appellantCaseData.reasonForAppealAppellant ?? ''
				}
			}
		]
	};

	return pageContent;
};
