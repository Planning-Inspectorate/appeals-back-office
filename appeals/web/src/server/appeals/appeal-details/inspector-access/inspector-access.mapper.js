/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/express').ValidationErrors} ValidationErrors
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/radio.js';

/**
 * @param {Appeal} appealData
 * @param {{radio: string, details: string}} storedSessionData
 * @param {string} origin
 * @param {string} source
 * @param {ValidationErrors|undefined} errors
 * @returns {PageContent}
 */
export const changeInspectorAccessPage = (
	appealData,
	storedSessionData,
	origin,
	source,
	errors = undefined
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const sourceKey = source === 'lpa' ? 'lpaQuestionnaire' : 'appellantCase';
	const formattedSource = source === 'lpa' ? 'LPA' : source;

	const currentRadioValue =
		storedSessionData?.radio ?? appealData.inspectorAccess[sourceKey].isRequired ?? '';
	const currentDetailsValue =
		storedSessionData?.details ?? appealData.inspectorAccess[sourceKey].details ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: `Change the inspector access (${formattedSource} answer)`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change the inspector access (${formattedSource} answer)`,
		pageComponents: [
			yesNoInput({
				name: 'inspectorAccessRadio',
				value: currentRadioValue,
				yesConditional: {
					id: 'inspectorAccessDetails',
					name: 'inspectorAccessDetails',
					error: errors?.inspectorAccessDetails,
					hint: `Inspector access (${formattedSource} details)`,
					details: currentDetailsValue
				}
			})
		]
	};
	return pageContent;
};
