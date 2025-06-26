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
export const changePreserveGrantLoan = (appealData, data, origin) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Preserve grant or loan',
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'preserveGrantLoanRadio',
				value: data,
				legendText: 'Was a grant or loan made to preserve the listed building at the appeal site?',
				legendIsPageHeading: true
			})
		]
	};
	return pageContent;
};
