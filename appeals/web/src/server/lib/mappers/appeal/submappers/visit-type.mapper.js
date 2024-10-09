import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapVisitType = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'set-visit-type',
		text: 'Visit type',
		value: appealDetails.siteVisit?.visitType || '',
		link: `${currentRoute}/site-visit/${
			appealDetails.siteVisit?.visitType ? 'visit-booked' : 'schedule-visit'
		}`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-visit-type'
	});
