/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/express').ValidationErrors} ValidationErrors
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/radio.js';
import { errorMessage } from '#lib/error-handlers/change-screen-error-handlers.js';

/**
 * @param {Appeal} appealData
 * @param {{radio: string, details: string}} storedSessionData
 * @param {string} backLinkUrl
 * @param {string} source
 * @param {ValidationErrors|undefined} errors
 * @returns {PageContent}
 */
export const changeSafetyRisksPage = (
	appealData,
	storedSessionData,
	backLinkUrl,
	source,
	errors = undefined
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const sourceKey = source === 'lpa' ? 'lpaQuestionnaire' : 'appellantCase';
	const formattedSource = source === 'lpa' ? 'LPA' : source;

	const currentRadioValue =
		storedSessionData?.radio ?? appealData.healthAndSafety[sourceKey].hasIssues ?? '';
	const currentDetailsValue =
		storedSessionData?.details ?? appealData.healthAndSafety[sourceKey].details ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: `Change the site health and safety risks (${formattedSource} answer)`,
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change the site health and safety risks (${formattedSource} answer)`,
		pageComponents: [
			yesNoInput({
				name: 'safetyRisksRadio',
				value: currentRadioValue,
				yesConditional: {
					id: 'safetyRisksDetails',
					name: 'safetyRisksDetails',
					hint: `Health and safety risks (${formattedSource} details)`,
					details: currentDetailsValue,
					errorMessage: errorMessage('safetyRisksDetails', errors)
				}
			})
		]
	};

	return pageContent;
};
