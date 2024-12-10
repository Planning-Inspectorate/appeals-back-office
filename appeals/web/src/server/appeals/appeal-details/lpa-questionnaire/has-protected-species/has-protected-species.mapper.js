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
export const changeHasProtectedSpecies = (appealData, data, origin) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Protected species`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'protectedSpeciesRadio',
				value: data,
				legendText: 'Change whether protected species affected',
				legendIsPageHeading: true,
				customYesLabel: 'Affected',
				customNoLabel: 'Not affected'
			})
		]
	};
	return pageContent;
};
