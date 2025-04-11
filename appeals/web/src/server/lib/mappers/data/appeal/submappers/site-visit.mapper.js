import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteVisit = ({ appealDetails, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'site-visit',
		text: 'Site visit',
		value: {
			html: 'Not set up'
		},
		link: `/appeals-service/appeal-details/${appealDetails.appealId}/site-visit/schedule-visit`,
		editable: userHasUpdateCasePermission,
		actionText: 'Set up'
	});
