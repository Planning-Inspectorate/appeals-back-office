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
export const changePdRightsRemovedPage = (appealData, lpaqData, storedSessionData, backLinkUrl) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const currentRadioValue = storedSessionData?.radio
		? convertFromYesNoToBoolean(storedSessionData?.radio)
		: !!lpaqData.article4AffectedDevelopmentRights;
	const currentDetailsValue =
		storedSessionData?.details ?? lpaqData.article4AffectedDevelopmentRights ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: 'Did you remove any permitted development rights for the appeal site?',
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'pdRightsRemovedRadio',
				value: currentRadioValue,
				legendText: 'Did you remove any permitted development rights for the appeal site?',
				legendIsPageHeading: true,
				yesConditional: {
					id: 'pd-rights-removed',
					name: 'pdRightsRemoved',
					hint: 'What permitted development rights did you remove with the direction',
					details: currentDetailsValue
				}
			})
		]
	};

	return pageContent;
};
