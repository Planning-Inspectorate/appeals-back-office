/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/radio.js';

/**
 * @param {Appeal} appealData
 * @param {string} data
 * @param {string} origin
 * @returns {PageContent}
 */
export const changeAffectsScheduledMonument = (appealData, data, origin) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Affects scheduled monument`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change whether scheduled monument affected`,
		pageComponents: [
			yesNoInput({
				name: 'affectsScheduledMonumentRadio',
				value: data,
				customYesLabel: 'Affected',
				customNoLabel: 'Not affected'
			})
		]
	};
	return pageContent;
};
