import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { dateAndTimeFormatter } from '../../global-mapper-formatter.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';
import { userHasPermission } from '#lib/mappers/permissions.mapper.js';
import { permissionNames } from '#environment/permissions.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapSiteVisitDate = ({ appealDetails, currentRoute, session }) => {
	const hasVisit = Boolean(appealDetails.siteVisit?.visitDate);
	const value =
		(hasVisit &&
			dateAndTimeFormatter(
				dateISOStringToDisplayDate(appealDetails.siteVisit?.visitDate),
				dateISOStringToDisplayTime12hr(appealDetails.siteVisit?.visitStartTime),
				dateISOStringToDisplayTime12hr(appealDetails.siteVisit?.visitEndTime)
			)) ||
		'Visit date not yet set';

	return textSummaryListItem({
		id: 'schedule-visit',
		text: 'Site visit',
		value: { html: value },
		link: `${currentRoute}/site-visit/${hasVisit ? 'manage' : 'schedule'}-visit`,
		actionText: hasVisit ? 'Change' : 'Arrange',
		editable: userHasPermission(permissionNames.setEvents, session),
		classes: 'appeal-site-visit'
	});
};
