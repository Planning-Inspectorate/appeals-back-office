import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapAgent = ({ appealDetails, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'agent',
		text: 'Agent',
		value: {
			html: appealDetails.agent ? formatServiceUserAsHtmlList(appealDetails.agent) : 'No agent'
		},
		link: `${currentRoute}/service-user/change/agent`,
		editable: userHasUpdateCase,
		classes: 'appeal-agent'
	});
