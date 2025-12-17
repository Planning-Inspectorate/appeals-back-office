import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @returns {PageContent}
 */
export function writtenOrVerbalPermissionNoticePage(appealData) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const writtenOrVerbalPermission =
		appealData.enforcementNotice?.appellantCase?.writtenOrVerbalPermission ?? null;

	const writtenOrVerbalPermissionComponent = yesNoInput({
		name: 'writtenOrVerbalPermission',
		id: 'written-or-verbal-permission',
		legendText: 'Do you have written or verbal permission to use the land?',
		legendIsPageHeading: true,
		value: writtenOrVerbalPermission,
		hint: 'Only select yes if you have permission to use the land today and on the enforcement notice issue date.'
	});

	/** @type {PageContent} */
	return {
		title: `Appellant Case - Written or Verbal Permission - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [writtenOrVerbalPermissionComponent]
	};
}
