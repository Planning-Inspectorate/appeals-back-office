import {
	SITE_VISIT_TYPE_ACCESS_REQUIRED,
	SITE_VISIT_TYPE_ACCOMPANIED,
	SITE_VISIT_TYPE_UNACCOMPANIED
} from '@pins/appeals/constants/support.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.SiteVisit} SiteVisit */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {string} outcome
 * @returns {outcome is SITE_VISIT_TYPE_ACCESS_REQUIRED | SITE_VISIT_TYPE_ACCOMPANIED | SITE_VISIT_TYPE_UNACCOMPANIED}}
 */
const isValidSiteVisitType = (outcome) =>
	[
		SITE_VISIT_TYPE_ACCESS_REQUIRED,
		SITE_VISIT_TYPE_ACCOMPANIED,
		SITE_VISIT_TYPE_UNACCOMPANIED
	].includes(outcome);

/**
 *
 * @param {MappingRequest} data
 * @returns {SiteVisit|undefined}
 */
export const mapSiteVisit = (data) => {
	const { appeal } = data;

	const siteVisit = Array.isArray(appeal.siteVisit)
		? appeal.siteVisit[0]
		: appeal.siteVisit;

	if (siteVisit) {
		return {
			siteVisitId: siteVisit.id,
			visitDate: siteVisit.visitDate?.toISOString() || '',
			visitStartTime: siteVisit.visitStartTime
				? siteVisit.visitStartTime.toISOString()
				: '',
			visitEndTime: siteVisit.visitEndTime
				? siteVisit.visitEndTime.toISOString()
				: '',
			visitType: isValidSiteVisitType(siteVisit.siteVisitType?.name)
				? siteVisit.siteVisitType.name
				: SITE_VISIT_TYPE_UNACCOMPANIED
		};
	}
};
