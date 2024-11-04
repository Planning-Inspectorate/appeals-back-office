/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {boolean|null|undefined} data
 * @param {string} origin
 * @returns {PageContent}
 */
export const changeIsGypsyOrTravellerSite = (appealData, data, origin) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Gypsy or Traveller communities status`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change whether Gypsy or Traveller communities affected`,
		pageComponents: [
			yesNoInput({
				name: 'isGypsyOrTravellerSiteRadio',
				value: data,
				customYesLabel: 'Affected',
				customNoLabel: 'Not affected'
			})
		]
	};
	return pageContent;
};
