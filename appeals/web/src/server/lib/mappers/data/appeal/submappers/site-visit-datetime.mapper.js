import config from '#environment/config.js';
import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteVisitDate = ({ appealDetails, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'site-visit-date',
		text: 'Date',
		value: {
			html: dateISOStringToDisplayDate(appealDetails.siteVisit?.visitDate)
		},
		link: `/appeals-service/appeal-details/${appealDetails.appealId}/site-visit/visit-booked`,
		editable: userHasUpdateCasePermission
	});

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteVisitStartTime = ({ appealDetails, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'site-visit-start-time',
		text: config.featureFlags.featureFlagCancelSiteVisit ? 'Time' : 'Start time',
		value: {
			html: dateISOStringToDisplayTime12hr(appealDetails.siteVisit?.visitStartTime)
		},
		link: `/appeals-service/appeal-details/${appealDetails.appealId}/site-visit/visit-booked`,
		editable: userHasUpdateCasePermission
	});

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteVisitEndTime = ({ appealDetails, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'site-visit-end-time',
		text: 'End time',
		value: {
			html: dateISOStringToDisplayTime12hr(appealDetails.siteVisit?.visitEndTime)
		},
		link: `/appeals-service/appeal-details/${appealDetails.appealId}/site-visit/visit-booked`,
		editable: userHasUpdateCasePermission
	});
