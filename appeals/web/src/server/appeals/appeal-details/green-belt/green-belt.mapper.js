/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/page-components/radio.js';

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
		heading: `Is the site in a green belt?`,
		pageComponents: [yesNoInput({ name: 'greenBeltRadio', value: data })]
	};
	return pageContent;
};
