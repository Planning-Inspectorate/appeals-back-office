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
export const changeApplicationOutcomeMapper = (appealData, storedSessionData, backLinkUrl) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const currentRadioValue = storedSessionData?.radio ?? appealData.applicationDecision ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: `What was the outcome of the application?`,
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `What was the outcome of the application?`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'applicationOutcomeRadio',
					id: 'application-outcome-radio',
					fieldSet: {
						legend: {
							text: `What was the outcome of the application?`,
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'granted',
							text: 'Granted',
							checked: currentRadioValue === 'granted'
						},
						{
							value: 'refused',
							text: 'Refused',
							checked: currentRadioValue === 'refused'
						},
						{
							value: 'not_received',
							text: 'Not received',
							checked: currentRadioValue === 'not_received'
						}
					]
				}
			}
		]
	};

	return pageContent;
};
