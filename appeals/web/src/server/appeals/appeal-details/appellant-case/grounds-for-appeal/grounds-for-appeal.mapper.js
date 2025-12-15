/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {string[]} selectedGrounds
 * @param {Record<string, string>} groundsForAppeal
 * @returns {PageContent}
 */
export const changeGroundsForAppealPage = (appealData, selectedGrounds, groundsForAppeal) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Choose your grounds of appeal',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					name: 'groundsForAppeal',
					idPrefix: 'grounds-for-appeal',
					fieldset: {
						legend: {
							text: 'Choose your grounds of appeal',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					hint: { text: 'Select all that apply' },
					// @ts-ignore
					items: groundsForAppeal?.map((ground) => ({
						value: ground.groundRef,
						text: `Ground (${ground.groundRef})`,
						hint: { text: ground.groundDescription },
						checked: selectedGrounds.some((selectedGround) => selectedGround === ground.groundRef)
					}))
				}
			}
		]
	};

	return pageContent;
};
