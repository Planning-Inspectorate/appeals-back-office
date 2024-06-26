/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{radio: string, details: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeSiteOwnershipPage = (appealData, appellantCaseData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let isFullyOwned = appellantCaseData.siteOwnership.ownsAllLand;
	let isPartiallyOwned = appellantCaseData.siteOwnership.ownsSomeLand;

	if (storedSessionData?.radio) {
		isFullyOwned = storedSessionData.radio === 'fully';
		isPartiallyOwned = storedSessionData.radio === 'partially';
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Change the site ownership`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change the site ownership`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'siteOwnershipRadio',
					id: 'site-ownership-radio',
					fieldSet: {
						legend: {
							text: `Is the site fully owned or partially owned by the appellant`,
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'fully',
							text: 'Fully owned by appellant',
							checked: isFullyOwned
						},
						{
							value: 'partially',
							text: 'Partially owned by appellant',
							checked: isPartiallyOwned
						},
						{
							value: 'none',
							text: 'Not owned by appellant',
							checked: !isFullyOwned && !isPartiallyOwned
						}
					]
				}
			}
		]
	};

	return pageContent;
};
