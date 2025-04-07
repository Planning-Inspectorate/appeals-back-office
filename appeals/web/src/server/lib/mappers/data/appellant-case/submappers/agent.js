import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAgent = ({ appealDetails, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'agent',
		text: 'Agent’s contact details',
		value: {
			html: appealDetails.agent ? formatServiceUserAsHtmlList(appealDetails.agent) : 'No data'
		},
		link: `${currentRoute}/service-user/change/agent`,
		editable: userHasUpdateCase,
		classes: 'appeal-agent'
	});
