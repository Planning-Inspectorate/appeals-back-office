import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { dateAndTimeFormatter } from '../../global-mapper-formatter.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapSiteVisitDate = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
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
		userHasEditPermission: userHasUpdateCasePermission,
		classes: 'appeal-site-visit'
	});
};
