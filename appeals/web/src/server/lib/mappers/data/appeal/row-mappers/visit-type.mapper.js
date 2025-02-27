import { permissionNames } from '#environment/permissions.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { userHasPermission } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapVisitType = ({ appealDetails, currentRoute, session }) =>
	textSummaryListItem({
		id: 'set-visit-type',
		text: 'Visit type',
		value: appealDetails.siteVisit?.visitType || '',
		link: `${currentRoute}/site-visit/${
			appealDetails.siteVisit?.visitType ? 'visit-booked' : 'schedule-visit'
		}`,
		editable: userHasPermission(permissionNames.setEvents, session),
		classes: 'appeal-visit-type'
	});
