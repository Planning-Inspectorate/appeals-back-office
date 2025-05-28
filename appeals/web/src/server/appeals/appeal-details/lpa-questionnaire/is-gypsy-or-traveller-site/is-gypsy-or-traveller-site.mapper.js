/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {boolean|null|undefined} data
 * @param {string} origin
 * @param {string} [errorMessage]
 * @returns {PageContent}
 */
export const changeIsGypsyOrTravellerSite = (appealData, data, origin, errorMessage) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Gypsy or Traveller communities status`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'isGypsyOrTravellerSiteRadio',
				value: data,
				legendText: 'Does the development relate to anyone claiming to be a Gypsy or Traveller?',
				legendIsPageHeading: true,
				errorMessage: errorMessage ? errorMessage : undefined
			})
		]
	};
	return pageContent;
};
