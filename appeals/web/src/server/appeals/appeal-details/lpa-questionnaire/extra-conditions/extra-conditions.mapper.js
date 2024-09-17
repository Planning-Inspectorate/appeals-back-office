/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { yesNoInput } from '#lib/page-components/radio.js';

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
			yesNoInput({
				name: 'extraConditionsRadio',
				id: 'extra-conditions-radio',
				legendText: `Are there extra conditions?`,
				value: currentRadioValue,
				yesConditional: {
					id: 'extra-conditions-details',
					name: 'extraConditionsDetails',
					hint: 'Extra conditions details',
					details: currentDetailsValue
				}
			})
		]
	};

	return pageContent;
};
