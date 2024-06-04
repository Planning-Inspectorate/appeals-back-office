/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Appeals.SingleSiteVisitDetailsResponse} SingleSiteVisitDetailsResponse */

/**
 * @param {Appeal} appeal
 * @returns {SingleSiteVisitDetailsResponse | void}
 */
const formatSiteVisit = (appeal) => {
	const { siteVisit } = appeal;

	if (siteVisit) {
		return {
			appealId: siteVisit.appealId,
			visitDate: siteVisit.visitDate,
			siteVisitId: siteVisit.id,
			visitEndTime: siteVisit.visitEndTime,
			visitStartTime: siteVisit.visitStartTime,
			visitType: siteVisit.siteVisitType.name
		};
	}
};

export { formatSiteVisit };
