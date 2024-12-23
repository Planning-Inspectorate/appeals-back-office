import {
	SITE_VISIT_TYPE_ACCESS_REQUIRED,
	SITE_VISIT_TYPE_ACCOMPANIED,
	SITE_VISIT_TYPE_UNACCOMPANIED
} from '#endpoints/constants.js';

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

	if (appeal.siteVisit) {
		return {
			siteVisitId: appeal.siteVisit.id,
			visitDate: appeal.siteVisit.visitDate?.toISOString() || '',
			visitStartTime: appeal.siteVisit.visitStartTime
				? appeal.siteVisit.visitStartTime.toISOString()
				: '',
			visitEndTime: appeal.siteVisit.visitEndTime
				? appeal.siteVisit.visitEndTime.toISOString()
				: '',
			visitType: isValidSiteVisitType(appeal.siteVisit.siteVisitType.name)
				? appeal.siteVisit.siteVisitType.name
				: SITE_VISIT_TYPE_UNACCOMPANIED
		};
	}
};
