/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.SiteVisit} SiteVisit */
/** @typedef {import('pins-data-model').Schemas.AppealEvent} AppealEvent */

/**
 *
 * @param {SiteVisit} siteVisit
 */
/**
 *
 * @param {SiteVisit} siteVisit
 * @returns {AppealEvent}
 */
export const mapSiteVisitEntity = (siteVisit) => {
	return {
		eventId: `${siteVisit.appeal?.reference}-1`,
		caseReference: siteVisit.appeal?.reference ?? '',
		// @ts-ignore
		eventType: siteVisit.siteVisitType.key,
		eventName: `Site visit #${siteVisit.id}`,
		eventStatus: 'offered',
		isUrgent: false,
		eventPublished: true,
		// @ts-ignore
		eventStartDateTime: (siteVisit.visitStartTime ?? siteVisit.visitDate)?.toISOString(),
		eventEndDateTime: siteVisit.visitEndTime?.toISOString() || null,
		notificationOfSiteVisit: null,
		...mapEventAddressOut(siteVisit.appeal)
	};
};
/**
 *
 * @param {Appeal | undefined} appeal
 * @returns
 */
export const mapEventAddressOut = (appeal) => {
	if (!appeal) {
		return null;
	}

	return {
		addressLine1: appeal.address?.addressLine1,
		addressLine2: appeal.address?.addressLine2 || '',
		addressCounty: appeal.address?.addressCounty || '',
		addressPostcode: appeal.address?.postcode,
		addressTown: appeal.address?.addressTown || ''
	};
};
