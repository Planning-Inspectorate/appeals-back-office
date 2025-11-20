import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {string | null} [enforcementNoticeListedBuilding]
 * @returns {PageContent}
 */
export function changeEnforcementNoticeListedBuildingPage(
	appealData,
	enforcementNoticeListedBuilding = null
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const enforcementNoticeListedBuildingComponent = yesNoInput({
		name: 'enforcementNoticeListedBuilding',
		id: 'enforcement-notice',
		legendText: 'Is your enforcement notice about a listed building?',
		legendIsPageHeading: true,
		value: enforcementNoticeListedBuilding
	});

	/** @type {PageContent} */
	return {
		title: `Enforcement notice - validation - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [enforcementNoticeListedBuildingComponent]
	};
}
