import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';
import { textDisplayField } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppellant = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textDisplayField({
		id: 'appellant',
		text: 'Appellant',
		value: {
			html: appealDetails.appellant
				? formatServiceUserAsHtmlList(appealDetails.appellant)
				: 'No appellant'
		},
		link: `${currentRoute}/service-user/change/appellant`,
		userHasEditPermission: userHasUpdateCasePermission,
		classes: 'appeal-appellant'
	});
