import { dateToDisplayDate } from '#lib/dates.js';
import { convert24hTo12hTimeStringFormat } from '#lib/times.js';
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
						dateToDisplayDate(appealDetails.siteVisit?.visitDate),
						convert24hTo12hTimeStringFormat(appealDetails.siteVisit?.visitStartTime),
						convert24hTo12hTimeStringFormat(appealDetails.siteVisit?.visitEndTime)
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
