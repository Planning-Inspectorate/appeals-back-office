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

	const isSourceLpa = source === 'lpa';
	const sourceKey = isSourceLpa ? 'lpaQuestionnaire' : 'appellantCase';

	const currentRadioValue =
		storedSessionData?.radio ?? appealData.inspectorAccess[sourceKey].isRequired ?? '';
	const currentDetailsValue =
		storedSessionData?.details ?? appealData.inspectorAccess[sourceKey].details ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: isSourceLpa
			? 'Will the inspector need access to the appellant’s land or property?'
			: 'Will an inspector need to access your land or property?',
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'inspectorAccessRadio',
				value: currentRadioValue,
				legendText: isSourceLpa
					? 'Will the inspector need access to the appellant’s land or property?'
					: 'Will an inspector need to access your land or property?',
				legendIsPageHeading: true,
				yesConditional: {
					id: 'inspector-access-details',
					name: 'inspectorAccessDetails',
					hint: isSourceLpa ? 'Enter the reason' : 'Enter reason',
					details: currentDetailsValue
				}
			})
		]
	};
	return pageContent;
};
