import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { permissionNames } from '#environment/permissions.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { isChildAppeal } from '#lib/mappers/utils/is-child-appeal.js';

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

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteVisitTimetable = ({ appealDetails, currentRoute, session, request }) => {
	const id = 'schedule-visit';
	if (!appealDetails.startedAt) {
		return { id, display: {} };
	}
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
		id,
		text: 'Site visit',
		value: { html: value },
		link: addBackLinkQueryToUrl(
			request,
			`${currentRoute}/site-visit/${hasVisit ? 'manage' : 'schedule'}-visit`
		),
		actionText: hasVisit ? 'Change' : 'Arrange',
		editable:
			!isChildAppeal(appealDetails) && userHasPermission(permissionNames.setEvents, session),
		classes: 'appeal-site-visit'
	});
};
