/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

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
		title: 'Are there any new conditions?',
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'extraConditionsRadio',
				value: currentRadioValue,
				legendText: 'Are there any new conditions?',
				legendIsPageHeading: true,
				yesConditional: {
					id: 'extra-conditions-details',
					name: 'extraConditionsDetails',
					hint: 'New conditions details',
					details: currentDetailsValue
				}
			})
		]
	};

	return pageContent;
};
