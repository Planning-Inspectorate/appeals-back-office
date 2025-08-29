import { permissionNames } from '#environment/permissions.js';
import { textSummaryListItem, userHasPermission } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapVisitType = ({ appealDetails, currentRoute, session, request }) =>
	textSummaryListItem({
		id: 'set-visit-type',
		text: 'Visit type',
		value: appealDetails.siteVisit?.visitType || '',
		link: addBackLinkQueryToUrl(
			request,
			`${currentRoute}/site-visit/${
				appealDetails.siteVisit?.visitType ? 'visit-booked' : 'schedule-visit'
			}`
		),
		editable: userHasPermission(permissionNames.setEvents, session),
		classes: 'appeal-visit-type'
	});
