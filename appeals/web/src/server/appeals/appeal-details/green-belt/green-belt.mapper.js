/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {string} data
 * @param {string} origin
 * @returns {PageContent}
 */
export const changeGreenBeltPage = (appealData, data, origin) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Is the site in a green belt?`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'greenBeltRadio',
				value: data,
				legendText: 'Is the site in a green belt?',
				legendIsPageHeading: true
			})
		]
	};
	return pageContent;
};
