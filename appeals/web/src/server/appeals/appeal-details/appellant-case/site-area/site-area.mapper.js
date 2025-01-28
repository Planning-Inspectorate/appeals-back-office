/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {string} storedSessionData
 * @returns {PageContent}
 */
export const changeSiteAreaPage = (appealData, appellantCaseData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const siteArea = storedSessionData ?? appellantCaseData?.siteAreaSquareMetres;

	/** @type {PageContent} */
	const pageContent = {
		title: 'Change the site area',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change the site area',
		pageComponents: [
			{
				type: 'input',
				parameters: {
					name: 'siteArea',
					id: 'site-area',
					label: {
						text: 'Site area in square metres '
					},
					classes: 'govuk-input--width-10',
					value: siteArea || '',
					suffix: {
						text: 'm²'
					}
				}
			}
		]
	};
	return pageContent;
};
