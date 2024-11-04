import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { permissionNames } from '#environment/permissions.js';

/**
 * @param {string} date
 * @param {string} [startTime]
 * @param {string} [endTime]
 */
export function dateAndTimeFormatter(date, startTime, endTime) {
	const to = endTime ? ` - ${endTime}` : '';
	const fromToListItem = startTime ? `<li>${startTime}${to}</li>` : '';
	return `<ul class="govuk-list govuk-!-margin-top-0 govuk-!-padding-left-0"><li>${date}</li>${fromToListItem}</ul>`;
}

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
