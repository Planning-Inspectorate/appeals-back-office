/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';

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
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'greenBeltRadio',
					id: 'green-belt-radio',
					items: [
						{
							value: 'yes',
							text: 'Yes',
							checked: data
						},
						{
							value: 'no',
							text: 'No',
							checked: !data
						}
					]
				}
			}
		]
	};
	return pageContent;
};
