import { textSummaryListItem } from '#lib/mappers/index.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellant = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'appellant',
		text: 'Appellant',
		value: {
			html: appealDetails.appellant
				? formatServiceUserAsHtmlList(appealDetails.appellant)
				: 'No data'
		},
		link: `${currentRoute}/service-user/change/appellant`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-appellant'
	});
