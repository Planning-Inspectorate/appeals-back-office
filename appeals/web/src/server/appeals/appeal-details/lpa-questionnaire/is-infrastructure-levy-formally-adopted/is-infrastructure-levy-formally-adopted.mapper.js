/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {boolean|null|undefined} existingValue
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export const changeIsInfrastructureLevyFormallyAdopted = (
	appealData,
	existingValue,
	backLinkUrl
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Levy formally adopted',
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'isInfrastructureLevyFormallyAdoptedRadio',
				value: existingValue,
				legendText: 'Change whether levy formally adopted',
				legendIsPageHeading: true,
				customYesLabel: 'Formally adopted',
				customNoLabel: 'Not formally adopted'
			})
		]
	};
	return pageContent;
};
