/**
 * @typedef {import('../../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {boolean|null|undefined} existingValue
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export const changeHasCommunityInfrastructureLevy = (appealData, existingValue, backLinkUrl) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Community infrastructure levy status',
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'hasCommunityInfrastructureLevyRadio',
				value: existingValue,
				legendText: 'Change community infrastructure levy status',
				legendIsPageHeading: true,
				customYesLabel: 'Has infrastructure levy',
				customNoLabel: 'Does not have infrastructure levy'
			})
		]
	};
	return pageContent;
};
