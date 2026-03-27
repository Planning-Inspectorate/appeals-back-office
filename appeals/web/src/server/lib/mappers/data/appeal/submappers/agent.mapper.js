import { textSummaryListItem } from '#lib/mappers/index.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAgent = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	const actionText = 'agent' in appealDetails ? 'Change' : 'Add';
	return textSummaryListItem({
		id: 'agent',
		text: 'Agent',
		value: {
			html: appealDetails.agent ? formatServiceUserAsHtmlList(appealDetails.agent) : 'No agent'
		},
		link: `${currentRoute}/service-user/${actionText.toLowerCase()}/agent`,
		editable: userHasUpdateCasePermission && !appealDetails.isChildAppeal,
		actionText,
		classes: 'appeal-agent'
	});
};
