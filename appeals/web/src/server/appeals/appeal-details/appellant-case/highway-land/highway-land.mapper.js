/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {string} storedSessionData
 * @returns {PageContent}
 */
export const changeHighwayLandPage = (appealData, appellantCaseData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const highwayLand = storedSessionData ?? appellantCaseData?.highwayLand;

	/** @type {PageContent} */
	const pageContent = {
		title: `Is the appeal site on highway land?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'highwayLandRadio',
				value: highwayLand,
				legendText: 'Is the appeal site on highway land?',
				legendIsPageHeading: true
			})
		]
	};
	return pageContent;
};
