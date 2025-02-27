import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapAppealType = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'appeal-type',
		text: 'Appeal type',
		value: appealDetails.appealType || 'No appeal type',
		link: `${currentRoute}/change-appeal-type/appeal-type`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-appeal-type'
	});
