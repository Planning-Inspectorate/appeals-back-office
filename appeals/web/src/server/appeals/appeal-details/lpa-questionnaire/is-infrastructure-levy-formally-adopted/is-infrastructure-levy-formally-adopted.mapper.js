/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/radio.js';

/**
 * @param {Appeal} appealData
 * @param {boolean|null} existingValue
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
		heading: 'Change whether levy formally adopted',
		pageComponents: [
			yesNoInput({
				name: 'isInfrastructureLevyFormallyAdoptedRadio',
				value: existingValue,
				customYesLabel: 'Formally adopted',
				customNoLabel: 'Not formally adopted'
			})
		]
	};
	return pageContent;
};