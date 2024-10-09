import { mapEventAddressOut } from './address.mapper.js';

/** @typedef {import('@pins/appeals.api').Schema.SiteVisit} SiteVisit */
/** @typedef {import('pins-data-model').Schemas.AppealEvent} AppealEvent */

/**
 *
 * @param {SiteVisit} siteVisit
 */
export const mapSiteVisitOut = (siteVisit) => {
	return {
		eventId: `${siteVisit.appeal?.reference}-1`,
		caseReference: siteVisit.appeal?.reference,
		eventType: siteVisit.siteVisitType.key,
		eventName: `Site visit #${siteVisit.id}`,
		eventStatus: 'offered',
		isUrgent: false,
		eventPublished: true,
		eventStartDateTime: (siteVisit.visitStartTime ?? siteVisit.visitDate)?.toISOString(),
		eventEndDateTime: siteVisit.visitEndTime?.toISOString() || null,
		notificationOfSiteVisit: null,
		...mapEventAddressOut(siteVisit.appeal)
	};
};
