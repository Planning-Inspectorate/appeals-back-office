/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{radio: boolean}} storedSessionData
 * @returns {PageContent}
 */
export const changeAdvertisementInPositionPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let advertisementInPosition = appellantCaseData.advertInPosition;

	if (storedSessionData?.radio) {
		advertisementInPosition = storedSessionData.radio;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Is the advertisement in position?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Is the advertisement in position?`,
		pageComponents: [
			yesNoInput({
				name: 'advertisementInPosition',
				value: advertisementInPosition,
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};
