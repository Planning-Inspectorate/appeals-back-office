/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {string} data
 * @param {string} origin
 * @param {string} [errorMessage]
 * @returns {PageContent}
 */
export const changeGreenBeltPage = (appealData, data, origin, errorMessage) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Is the appeal site in a green belt?`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'greenBeltRadio',
				value: data,
				legendText: 'Is the appeal site in a green belt?',
				legendIsPageHeading: true,
				errorMessage: errorMessage ? errorMessage : undefined
			})
		]
	};
	return pageContent;
};
