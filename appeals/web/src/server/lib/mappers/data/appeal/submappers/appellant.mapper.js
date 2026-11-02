import { textSummaryListItem } from '#lib/mappers/index.js';
import { formatAppellantAsHtmlList } from '#lib/service-user-formatter.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellant = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	const hasAppellant = Boolean(appealDetails.appellant);
	const actionText = hasAppellant ? 'Change' : 'Add';

	return textSummaryListItem({
		id: 'appellant',
		text: 'Appellant',
		value: {
			html: appealDetails.appellant
				? formatAppellantAsHtmlList(appealDetails.appellant, appealDetails.agent)
				: 'No data'
		},
		link: `${currentRoute}/service-user/${actionText.toLowerCase()}/appellant`,
		editable: userHasUpdateCasePermission,
		actionText,
		classes: 'appeal-appellant'
	});
};
