/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/express').ValidationErrors} ValidationErrors
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { yesNoInput } from '#lib/mappers/components/radio.js';
import { errorMessage } from '#lib/error-handlers/change-screen-error-handlers.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} lpaqData
 * @param {{radio: string, details: string}} storedSessionData
 * @param {string} backLinkUrl
 * @param {ValidationErrors|undefined} errors
 * @returns {PageContent}
 */
export const changeExtraConditionsPage = (
	appealData,
	lpaqData,
	storedSessionData,
	backLinkUrl,
	errors = undefined
) => {
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
				value: currentRadioValue,
				yesConditional: {
					id: 'extraConditionsDetails',
					name: 'extraConditionsDetails',
					hint: 'Extra conditions details',
					details: currentDetailsValue,
					errorMessage: errorMessage('extraConditionsDetails', errors)
				}
			})
		]
	};

	return pageContent;
};
