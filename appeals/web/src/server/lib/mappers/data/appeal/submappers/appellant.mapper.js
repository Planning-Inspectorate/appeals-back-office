import { textSummaryListItem } from '#lib/mappers/index.js';
import { formatAppellantAsHtmlList } from '#lib/service-user-formatter.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellant = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'appellant',
		text: 'Appellant',
		value: {
			html: appealDetails.appellant
				? formatAppellantAsHtmlList(appealDetails.appellant, appealDetails.agent)
				: 'No data'
		},
		link: `${currentRoute}/service-user/change/appellant`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-appellant'
	});
