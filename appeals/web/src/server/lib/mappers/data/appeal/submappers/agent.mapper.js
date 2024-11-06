import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAgent = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'agent',
		text: 'Agent',
		value: {
			html: appealDetails.agent ? formatServiceUserAsHtmlList(appealDetails.agent) : 'No agent'
		},
		link: `${currentRoute}/service-user/change/agent`,
		editable: 'agent' in appealDetails && userHasUpdateCasePermission,
		classes: 'appeal-agent'
	});
