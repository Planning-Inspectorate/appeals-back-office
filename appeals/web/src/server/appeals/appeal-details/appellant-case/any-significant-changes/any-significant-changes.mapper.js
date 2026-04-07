/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/page-components/index.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @returns {PageContent}
 */
export const manageSignificantChangesPage = (appealData, appellantCaseData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const isYesSelected = appellantCaseData?.anySignificantChanges
		? appellantCaseData?.anySignificantChanges.toLowerCase()
		: 'no';
	/** @type {PageContent} */
	const pageContent = {
		title: `Have there been any significant changes that would affect the application?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'anySignificantChangesRadio',
				value: isYesSelected,
				legendText: 'Have there been any significant changes that would affect the application?',
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};
