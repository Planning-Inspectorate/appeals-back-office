/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {{radio: string, details: string}} storedSessionData
 * @param {string} origin
 * @param {string} source
 * @returns {PageContent}
 */
export const changeInspectorAccessPage = (appealData, storedSessionData, origin, source) => {
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
		pageComponents: [
			yesNoInput({
				name: 'inspectorAccessRadio',
				value: currentRadioValue,
				legendText: `Change the inspector access (${formattedSource} answer)`,
				legendIsPageHeading: true,
				yesConditional: {
					id: 'inspector-access-details',
					name: 'inspectorAccessDetails',
					hint: `Inspector access (${formattedSource} details)`,
					details: currentDetailsValue
				}
			})
		]
	};
	return pageContent;
};
