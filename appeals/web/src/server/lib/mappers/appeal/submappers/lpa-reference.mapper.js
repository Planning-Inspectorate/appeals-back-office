import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaReference = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'lpa-reference',
		text: 'LPA application reference',
		value:
			appealDetails.planningApplicationReference || 'No LPA application reference for this appeal',
		link: `${currentRoute}/lpa-reference/change`,
		userHasEditPermission: userHasUpdateCasePermission,
		classes: 'appeal-lpa-reference'
	});
