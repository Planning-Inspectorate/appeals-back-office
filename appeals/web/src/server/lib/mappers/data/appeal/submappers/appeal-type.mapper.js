import { textSummaryListItem } from '#lib/mappers/index.js';
import isLinkedAppeal from '#lib/mappers/utils/is-linked-appeal.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppealType = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'appeal-type',
		text: 'Appeal type',
		value: appealDetails.appealType || 'No appeal type',
		link: `${currentRoute}/change-appeal-type/appeal-type`,
		editable: userHasUpdateCasePermission && !isLinkedAppeal(appealDetails),
		classes: 'appeal-appeal-type'
	});
