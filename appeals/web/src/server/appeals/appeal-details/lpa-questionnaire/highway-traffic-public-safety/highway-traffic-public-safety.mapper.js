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
export const changeHighwayTrafficPublicSafety = (appealData, data, origin) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Did you refuse the application because of highway or traffic public safety?',
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'highwayTrafficPublicSafetyRadio',
				value: data,
				legendText: 'Did you refuse the application because of highway or traffic public safety?',
				legendIsPageHeading: true
			})
		]
	};
	return pageContent;
};
