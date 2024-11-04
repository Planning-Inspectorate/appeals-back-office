import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaReference = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'lpa-reference',
		text: 'LPA application reference',
		value:
			appealDetails.planningApplicationReference || 'No LPA application reference for this appeal',
		link: `${currentRoute}/lpa-reference/change`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-lpa-reference'
	});
