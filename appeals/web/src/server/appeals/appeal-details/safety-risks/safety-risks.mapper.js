/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {{radio: string, details: string}} storedSessionData
 * @param {string} backLinkUrl
 * @param {string} source
 * @returns {PageContent}
 */
export const changeSafetyRisksPage = (appealData, storedSessionData, backLinkUrl, source) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const sourceKey = source === 'lpa' ? 'lpaQuestionnaire' : 'appellantCase';
	const formattedSource = source === 'lpa' ? 'LPA' : source;

	const currentRadioValue =
		storedSessionData?.radio ?? appealData.healthAndSafety[sourceKey].hasIssues ?? '';
	const currentDetailsValue =
		storedSessionData?.details ?? appealData.healthAndSafety[sourceKey].details ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: `Change the site health and safety risks (${formattedSource} answer)`,
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'safetyRisksRadio',
				value: currentRadioValue,
				legendText: `Change the site health and safety risks (${formattedSource} answer)`,
				legendIsPageHeading: true,
				yesConditional: {
					id: 'safety-risks-details',
					name: 'safetyRisksDetails',
					hint: `Health and safety risks (${formattedSource} details)`,
					details: currentDetailsValue
				}
			})
		]
	};

	return pageContent;
};
