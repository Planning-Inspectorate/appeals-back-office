/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/radio.js';

/**
 * @param {Appeal} appealData
 * @param {string} data
 * @param {string} origin
 * @returns {PageContent}
 */
export const changeHasProtectedSpecies = (appealData, data, origin) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Protected species`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change whether protected species affected`,
		pageComponents: [
			yesNoInput({
				name: 'protectedSpeciesRadio',
				value: data,
				customYesLabel: 'Affected',
				customNoLabel: 'Not affected'
			})
		]
	};
	return pageContent;
};