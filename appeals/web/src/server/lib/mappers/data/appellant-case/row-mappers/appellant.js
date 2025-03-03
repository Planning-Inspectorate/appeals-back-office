import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapAppellant = ({ appealDetails, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'appellant',
		text: 'Appellant',
		value: {
			html: appealDetails.appellant
				? formatServiceUserAsHtmlList(appealDetails.appellant)
				: 'No appellant'
		},
		link: `${currentRoute}/service-user/change/appellant`,
		editable: userHasUpdateCase,
		classes: 'appeal-appellant',
		cypressDataName: 'appellant'
	});
