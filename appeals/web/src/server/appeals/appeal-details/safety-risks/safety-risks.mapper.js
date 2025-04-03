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
	const isSourceLpa = source === 'lpa';
	const sourceKey = isSourceLpa ? 'lpaQuestionnaire' : 'appellantCase';

	const currentRadioValue =
		storedSessionData?.radio ?? appealData.healthAndSafety[sourceKey].hasIssues ?? '';
	const currentDetailsValue =
		storedSessionData?.details ?? appealData.healthAndSafety[sourceKey].details ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: isSourceLpa
			? 'Are there any potential safety risks?'
			: 'Are there any health and safety issues on the appeal site?',
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'safetyRisksRadio',
				value: currentRadioValue,
				legendText: isSourceLpa
					? 'Are there any potential safety risks?'
					: 'Are there any health and safety issues on the appeal site?',
				legendIsPageHeading: true,
				yesConditional: {
					id: 'safety-risks-details',
					name: 'safetyRisksDetails',
					hint: isSourceLpa
						? 'Add details of the potential risk and what the inspector might need'
						: 'Enter reason',
					details: currentDetailsValue
				}
			})
		]
	};

	return pageContent;
};
