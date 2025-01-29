/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.SiteVisit & {appeal: Appeal}} SiteVisitWithAppeal */
/** @typedef {import('pins-data-model').Schemas.AppealEvent} AppealEvent */

/**
 *
 * @param {SiteVisitWithAppeal} siteVisit
 * @returns {AppealEvent}
 */
export const mapSiteVisitEntity = (siteVisit) => {
	return {
		eventId: `${siteVisit.appeal?.reference}-1`,
		caseReference: siteVisit.appeal?.reference ?? '',
		eventType:
			/** @type {"site_visit_access_required" | "site_visit_accompanied" | "site_visit_unaccompanied" | "hearing" | "hearing_virtual" | "inquiry" | "inquiry_virtual" | "in_house" | "pre_inquiry" | "pre_inquiry_virtual"} */ (
				siteVisit.siteVisitType.key
			),
		eventName: `Site visit #${siteVisit.id}`,
		eventStatus: 'offered',
		isUrgent: false,
		eventPublished: true,
		eventStartDateTime: (siteVisit.visitStartTime ?? siteVisit.visitDate)?.toISOString() ?? '',
		eventEndDateTime: siteVisit.visitEndTime?.toISOString() || null,
		notificationOfSiteVisit: null,
		...mapEventAddressOut(siteVisit.appeal)
	};
};
/**
 *
 * @param {Appeal} appeal
 * @returns {{addressLine1:string, addressLine2:string, addressCounty:string, addressPostcode:string, addressTown:string}}
 */
export const mapEventAddressOut = (appeal) => {
	return {
		addressLine1: appeal.address?.addressLine1 || '',
		addressLine2: appeal.address?.addressLine2 || '',
		addressCounty: appeal.address?.addressCounty || '',
		addressPostcode: appeal.address?.postcode || '',
		addressTown: appeal.address?.addressTown || ''
	};
};
