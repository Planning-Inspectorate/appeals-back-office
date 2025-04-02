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
		title: 'What is the area of the appeal site?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'What is the area of the appeal site?',
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
