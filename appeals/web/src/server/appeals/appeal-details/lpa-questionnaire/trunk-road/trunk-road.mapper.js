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
export const changeTrunkRoadPage = (appealData, lpaqData, storedSessionData, backLinkUrl) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const currentRadioValue = storedSessionData?.radio
		? convertFromYesNoToBoolean(storedSessionData?.radio)
		: !!lpaqData.affectedTrunkRoadName;
	const currentDetailsValue = storedSessionData?.details ?? lpaqData.affectedTrunkRoadName ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: 'Is the appeal site within 67 metres of a trunk road?',
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'trunkRoadRadio',
				value: currentRadioValue,
				legendText: 'Is the appeal site within 67 metres of a trunk road?',
				legendIsPageHeading: true,
				yesConditional: {
					id: 'trunk-road-details',
					name: 'trunkRoadDetails',
					hint: 'Enter the road name',
					details: currentDetailsValue
				}
			})
		]
	};

	return pageContent;
};
