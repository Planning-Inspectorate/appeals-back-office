import { mapEventAddressOut } from './address.mapper.js';

/** @typedef {import('@pins/appeals.api').Schema.SiteVisit} SiteVisit */
/** @typedef {import('pins-data-model').Schemas.AppealEvent} AppealEvent */

/**
 *
 * @param {SiteVisit} siteVisit
 */
export const mapSiteVisitOut = (siteVisit) => {
	let visitDate, startDate, endDate;
	const startTime = siteVisit.visitStartTime;
	const endTime = siteVisit.visitEndTime;

	if (typeof siteVisit.visitDate === 'string') {
		// @ts-ignore
		visitDate = siteVisit.visitDate.split('T')[0];
	} else {
		visitDate = siteVisit.visitDate?.toISOString().split('T')[0];
	}

	startDate =
		startTime != null && startTime != ''
			? new Date(`${visitDate}T${startTime}`).toISOString()
			: new Date(`${visitDate}`).toISOString();
	endDate =
		endTime != null && endTime !== '' ? new Date(`${visitDate}T${endTime}`).toISOString() : null;

	return {
		eventId: `${siteVisit.appeal.reference}-1`,
		caseReference: siteVisit.appeal.reference,
		eventType: siteVisit.siteVisitType.key,
		eventName: `Site visit #${siteVisit.id}`,
		eventStatus: 'offered',
		isUrgent: false,
		eventPublished: true,
		eventStartDateTime: startDate,
		eventEndDateTime: endDate,
		notificationOfSiteVisit: null,
		...mapEventAddressOut(siteVisit.appeal)
	};
};
