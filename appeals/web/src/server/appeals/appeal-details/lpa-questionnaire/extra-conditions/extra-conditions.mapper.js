/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { conditionalFormatter } from '#lib/mappers/global-mapper-formatter.js';
import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} lpaqData
 * @param {{radio: string, details: string}} storedSessionData
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export const changeExtraConditionsPage = (appealData, lpaqData, storedSessionData, backLinkUrl) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const currentRadioValue = storedSessionData?.radio
		? convertFromYesNoToBoolean(storedSessionData?.radio)
		: !!lpaqData.hasExtraConditions;
	const currentDetailsValue = storedSessionData?.details ?? lpaqData.extraConditions ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: `Change extra conditions`,
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change extra conditions`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'extraConditionsRadio',
					id: 'extra-conditions-radio',
					fieldSet: {
						legend: {
							text: `Are there extra conditions?`,
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'yes',
							text: 'Yes',
							conditional: conditionalFormatter(
								'extra-conditions-details',
								'extraConditionsDetails',
								`Extra conditions details`,
								currentDetailsValue
							),
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
