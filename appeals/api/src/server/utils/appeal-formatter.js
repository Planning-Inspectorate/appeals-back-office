// @ts-check

import { filterExists } from '@pins/platform';
import { arrayOfStatusesContainsString } from './array-of-statuses-contains-string.js';
import formatDate from './date-formatter.js';
import daysBetweenDates from './days-between-dates.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.AppealStatus} AppealStatus */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} InspectorDecision */
/** @typedef {import('@pins/appeals.api').Schema.SiteVisit} SiteVisit */

/**
 * @param {Appeal} appeal
 * @returns {Object<string, ?>} - TODO: Link this type to web/response definition
 */
export const formatAppeal = ({
	inspectorDecision,
	siteVisit,
	id: appealId,
	createdAt,
	appealStatus,
	reference,
	localPlanningDepartment,
	planningApplicationReference,
	startedAt
}) =>
	filterExists({
		appealId,
		status: formatStatus(appealStatus),
		appealReceivedDate: formatDate(createdAt, false),
		appealAge: startedAt && daysBetweenDates(startedAt, new Date()),
		reference,
		localPlanningDepartment,
		planningApplicationReference,
		bookedSiteVisit: siteVisit && formatSiteVisit(siteVisit),
		inspectorDecision: inspectorDecision && formatInspector(inspectorDecision)
	});

/**
 * @param {InspectorDecision} inspectorDecision
 * @returns {Object<string, ?>} - TODO: Link this type to web definition
 */
function formatInspector({ outcome }) {
	return { outcome };
}

/**
 * @param {SiteVisit} siteVisit
 * @returns {Object<string, ?>} - TODO: Link this type to web definition
 */
function formatSiteVisit({ visitDate, visitSlot, visitType }) {
	return {
		visitDate: formatDate(visitDate, false),
		visitSlot,
		visitType
	};
}

/**
 * @param {AppealStatus[]} appealStatuses
 * @returns {string}
 */
function formatStatus(appealStatuses) {
	if (arrayOfStatusesContainsString(appealStatuses, 'site_visit_booked')) return 'booked';
	if (arrayOfStatusesContainsString(appealStatuses, 'decision_due')) return 'decision due';
	if (arrayOfStatusesContainsString(appealStatuses, 'site_visit_not_yet_booked'))
		return 'not yet booked';
	if (arrayOfStatusesContainsString(appealStatuses, 'appeal_decided')) return 'appeal decided';
	throw new Error('Unknown status');
}

/**
 * @param {Object[]} reasonsArray - The array of reasons objects containing incomplete or invalid reasons
 * @returns {string[]} - List of formatted reasons
 */
export const getFormattedReasons = (reasonsArray) => {
	if (!reasonsArray || reasonsArray.length === 0) {
		throw new Error('No reasons found');
	}

	// Infer keys from the first item in the array
	const firstItem = reasonsArray[0];
	const reasonNameKey = Object.keys(firstItem).find(
		(key) => /Reason$/.test(key) && !/ReasonId$/.test(key)
	);
	const reasonTextKey = Object.keys(firstItem).find((key) => /ReasonText$/.test(key));

	if (!reasonNameKey || !reasonTextKey) {
		throw new Error('Unable to infer keys from the given array');
	}

	return reasonsArray.flatMap((item) => {
		if (item[reasonTextKey].length > 0) {
			return item[reasonTextKey].map((textItem) => `${item[reasonNameKey].name}: ${textItem.text}`);
		} else {
			return [item[reasonNameKey].name];
		}
	});
};
