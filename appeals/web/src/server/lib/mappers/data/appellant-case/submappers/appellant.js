import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellant = ({ appealDetails, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'appellant',
		text: 'Update appellant details',
		value: {
			html: appealDetails.appellant
				? formatServiceUserAsHtmlList(appealDetails.appellant)
				: 'No data'
		},
		link: `${currentRoute}/service-user/change/appellant`,
		editable: userHasUpdateCase,
		classes: 'appeal-appellant',
		cypressDataName: 'appellant'
	});
