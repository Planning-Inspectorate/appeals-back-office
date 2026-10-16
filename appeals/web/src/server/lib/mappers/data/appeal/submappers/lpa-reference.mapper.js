import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaReference = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'lpa-reference',
		text: 'Planning application reference',
		value:
			appealDetails.planningApplicationReference || 'No LPA application reference for this appeal',
		link: `${currentRoute}/lpa-reference/change`,
		editable: userHasUpdateCasePermission,
		actionText: appealDetails.planningApplicationReference ? 'Change' : 'Add',
		classes: 'appeal-lpa-reference'
	});
