/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.SiteVisit & {appeal: Appeal}} SiteVisitWithAppeal */
/** @typedef {import('@pins/appeals.api').Schema.Hearing & {appeal: Appeal}} HearingWithAppeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealEvent} AppealEvent */
/** @typedef {import('@pins/appeals.api').Schema.Address} Address */
import { EventType } from '@pins/event-client';

import { EVENT_TYPE } from '@pins/appeals/constants/common.js';

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
		...mapEventAddress(siteVisit.appeal.address)
	};
};

/**
 *
 * @param {HearingWithAppeal} hearing
 * @param { EventType } updateType
 * @returns {AppealEvent}
 */
export const mapHearingEntity = (hearing, updateType) => {
	return {
		eventId: `${hearing.appeal?.reference}-1`,
		caseReference: hearing.appeal?.reference ?? '',
		eventType: EVENT_TYPE.HEARING,
		eventName: `Hearing #${hearing.id}`,
		eventStatus: updateType === EventType.Delete ? 'withdrawn' : 'offered',
		isUrgent: false,
		eventPublished: true,
		eventStartDateTime: (hearing.hearingStartTime ?? hearing.hearingStartTime)?.toISOString() ?? '',
		eventEndDateTime: hearing.hearingEndTime?.toISOString() || null,
		notificationOfSiteVisit: null,
		...mapEventAddress(hearing.address)
	};
};

/**
 *
 * @param {Address | null | undefined} address
 * @returns {{addressLine1:string, addressLine2:string, addressCounty:string, addressPostcode:string, addressTown:string}}
 */
export const mapEventAddress = (address) => {
	return {
		addressLine1: address?.addressLine1 || '',
		addressLine2: address?.addressLine2 || '',
		addressCounty: address?.addressCounty || '',
		addressPostcode: address?.postcode || '',
		addressTown: address?.addressTown || ''
	};
};
