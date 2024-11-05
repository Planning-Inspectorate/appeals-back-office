/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {string} data
 * @param {string} origin
 * @returns {PageContent}
 */
export const changeAppealCostsApplicationPage = (appealData, data, origin) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Change the application for appellant award of costs`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Did the appellant apply for an award of costs?`,
		pageComponents: [
			yesNoInput({
				name: 'appealCostsApplicationRadio',
				value: data
			})
		]
	};

	return pageContent;
};
