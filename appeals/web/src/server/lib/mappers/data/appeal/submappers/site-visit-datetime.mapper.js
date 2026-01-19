import config from '#environment/config.js';
import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteVisitDate = ({ appealDetails, userHasUpdateCasePermission, request }) => {
	const link = addBackLinkQueryToUrl(
		request,
		`/appeals-service/appeal-details/${appealDetails.appealId}/site-visit-v2/schedule/schedule-visit-date`
	);
	return textSummaryListItem({
		id: 'site-visit-date',
		text: 'Date',
		value: {
			html: appealDetails.siteVisit?.visitDate
				? dateISOStringToDisplayDate(appealDetails.siteVisit?.visitDate)
				: `<a class="govuk-link" href="${link}">Enter date</a>`
		},
		link: link,
		editable: userHasUpdateCasePermission
	});
};
/** @type {import('../mapper.js').SubMapper} */
export const mapSiteVisitStartTime = ({ appealDetails, userHasUpdateCasePermission, request }) => {
	const link = addBackLinkQueryToUrl(
		request,
		`/appeals-service/appeal-details/${appealDetails.appealId}/site-visit-v2/schedule/schedule-visit-date`
	);
	return textSummaryListItem({
		id: 'site-visit-start-time',
		text: config.featureFlags.featureFlagCancelSiteVisit ? 'Time' : 'Start time',
		value: {
			html: appealDetails.siteVisit?.visitStartTime
				? dateISOStringToDisplayTime12hr(appealDetails.siteVisit?.visitStartTime)
				: `<a class="govuk-link" href="${link}">Enter time</a>`
		},
		link: link,
		editable: userHasUpdateCasePermission
	});
};
/** @type {import('../mapper.js').SubMapper} */
export const mapSiteVisitEndTime = ({ appealDetails, userHasUpdateCasePermission, request }) => {
	const link = addBackLinkQueryToUrl(
		request,
		`/appeals-service/appeal-details/${appealDetails.appealId}/site-visit-v2/schedule/schedule-visit-date`
	);
	return textSummaryListItem({
		id: 'site-visit-end-time',
		text: 'End times',
		value: {
			html: appealDetails.siteVisit?.visitEndTime
				? dateISOStringToDisplayTime12hr(appealDetails.siteVisit?.visitEndTime)
				: `<a class="govuk-link" href="${link}">Enter time</a>`
		},
		link: link,
		editable: userHasUpdateCasePermission
	});
};
