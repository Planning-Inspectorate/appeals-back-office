import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAgent = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	const actionText = 'agent' in appealDetails ? 'Change' : 'Add';
	return textSummaryListItem({
		id: 'agent',
		text: 'Agent',
		value: {
			html: appealDetails.agent ? formatServiceUserAsHtmlList(appealDetails.agent) : 'No data'
		},
		link: `${currentRoute}/service-user/${actionText.toLowerCase()}/agent`,
		editable: userHasUpdateCasePermission,
		actionText,
		classes: 'appeal-agent'
	});
};
