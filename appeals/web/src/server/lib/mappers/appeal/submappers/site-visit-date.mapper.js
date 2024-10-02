import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { dateAndTimeFormatter } from '../../global-mapper-formatter.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapSiteVisitDate = ({ appealDetails, currentRoute }) => ({
	id: 'schedule-visit',
	display: {
		summaryListItem: {
			key: {
				text: 'Site visit'
			},
			value: {
				html:
					dateAndTimeFormatter(
						dateISOStringToDisplayDate(appealDetails.siteVisit?.visitDate),
						dateISOStringToDisplayTime12hr(appealDetails.siteVisit?.visitStartTime),
						dateISOStringToDisplayTime12hr(appealDetails.siteVisit?.visitEndTime)
					) || 'Visit date not yet set'
			},
			actions: {
				items: [
					{
						text: appealDetails.siteVisit?.visitDate ? 'Change' : 'Arrange',
						href: `${currentRoute}/site-visit/${
							appealDetails.siteVisit?.visitDate ? 'manage' : 'schedule'
						}-visit`,
						visuallyHiddenText: 'site visit',
						attributes: {
							'data-cy':
								(appealDetails.siteVisit?.visitDate ? 'change' : 'arrange') + '-schedule-visit'
						}
					}
				]
			},
			classes: 'appeal-site-visit'
		}
	}
});
