/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {{ radio: string, details: string }} storedSessionData
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export const changeLPAChangedDescriptionMapper = (appealData, storedSessionData, backLinkUrl) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const currentRadioValue =
		storedSessionData?.radio ?? appealData.developmentDescription?.isCorrect ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: `Did the LPA change the description of the development?`,
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Did the LPA change the description of the development?`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'lpaChangedDescriptionRadio',
					id: 'lpa-changed-description-radio',
					fieldSet: {
						legend: {
							text: `Did the LPA change the description of the development?`,
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'yes',
							text: 'Yes',
							checked: currentRadioValue
						},
						{
							value: 'no',
							text: 'No',
							checked: !currentRadioValue
						}
					]
				}
			}
		]
	};

	return pageContent;
};
