/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/radio.js';

/**
 * @param {Appeal} appealData
 * @param {boolean|null|undefined} data
 * @param {string} origin
 * @returns {PageContent}
 */
export const changeIsAonbNationalLandscape = (appealData, data, origin) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Outstanding natural beauty area`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change whether in area of outstanding natural beauty`,
		pageComponents: [
			yesNoInput({
				name: 'isAonbNationalLandscapeRadio',
				value: data,
				customYesLabel: 'In area',
				customNoLabel: 'Not in area'
			})
		]
	};
	return pageContent;
};
