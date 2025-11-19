import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {string | null} [enforcementNotice]
 * @returns {PageContent}
 */
export function changeEnforcementNoticePage(appealData, enforcementNotice = null) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const enforcementNoticeComponent = yesNoInput({
		name: 'enforcementNotice',
		id: 'enforcement-notice',
		legendText: 'Have you received an enforcement notice?',
		legendIsPageHeading: true,
		value: enforcementNotice
	});

	/** @type {PageContent} */
	return {
		title: `Enforcement notice - validation - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [enforcementNoticeComponent]
	};
}
