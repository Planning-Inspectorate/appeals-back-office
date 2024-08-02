/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';

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
			{
				type: 'radios',
				parameters: {
					name: 'appealCostsApplicationRadio',
					id: 'appeal-costs-application-radio',
					fieldSet: {
						legend: {
							text: `Was an award of costs applied for?`,
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'yes',
							text: 'Yes',
							checked: !!data
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
