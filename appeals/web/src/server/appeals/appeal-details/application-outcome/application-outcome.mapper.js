/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {string} storedSessionData
 * @returns {PageContent}
 */
export const changeApplicationOutcomePage = (appealData, appellantCaseData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Change the application outcome',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `What was the application decision?`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'application-outcome',
					id: 'application-outcome',
					fieldSet: {
						legend: {
							text: `What was the application decision?`,
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--1'
						}
					},
					items: [
						{
							value: 'granted',
							text: 'Granted',
							checked:
								storedSessionData === 'granted' ||
								appellantCaseData.applicationDecision === 'granted'
						},
						{
							value: 'refused',
							text: 'Refused',
							checked:
								storedSessionData === 'refused' ||
								appellantCaseData.applicationDecision === 'refused'
						},
						{
							value: 'not_received',
							text: 'Not received',
							checked:
								storedSessionData === 'not_received' ||
								appellantCaseData.applicationDecision == 'not_received'
						}
					]
				}
			}
		]
	};

	return pageContent;
};
