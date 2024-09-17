/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/page-components/radio.js';

/**
 * @param {Appeal} appealData
 * @param {{ radio: string, details: string }} storedSessionData
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export const changeLPAChangedDescriptionMapper = (appealData, storedSessionData, backLinkUrl) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const currentRadioValue =
		storedSessionData?.radio ?? appealData.developmentDescription?.isChanged ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: `Did the LPA change the description of the development?`,
		backLinkUrl: backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Did the LPA change the description of the development?`,
		pageComponents: [
			yesNoInput({
				name: 'lpaChangedDescriptionRadio',
				id: 'lpa-changed-description-radio',
				legendText: 'Did the LPA change the description of the development?',
				value: currentRadioValue
			})
		]
	};

	return pageContent;
};
