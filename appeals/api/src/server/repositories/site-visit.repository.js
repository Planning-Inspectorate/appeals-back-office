import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.SiteVisit} SiteVisit */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {{
 *  appealId: number;
 * 	visitDate?: Date;
 * 	visitEndTime?: Date;
 * 	visitStartTime?: Date;
 * 	siteVisitTypeId?: number;
 * }} data
 * @returns
 */
const createSiteVisitById = (data) =>
	databaseConnector.siteVisit.create({
		data
	});

/**
 * @param {number} id
 * @param {{
 * 	visitDate?: Date;
 * 	visitEndTime?: Date;
 * 	visitStartTime?: Date;
 * 	siteVisitTypeId?: number;
 * 	whoMissedSiteVisit?: string
 * }} data
 * @returns {PrismaPromise<object>}
 */
const updateSiteVisitById = (id, data) =>
	databaseConnector.siteVisit.update({
		where: { id },
		data
	});

/**
 * @param {number} id
 * */
const deleteSiteVisitById = (id) =>
	databaseConnector.siteVisit.delete({
		where: { id }
	});

/**
 *
 * @param {number} appealId
 * @returns
 */
const getMissedSiteVisitByAppealId = (appealId) => {
	return databaseConnector.siteVisit.findFirst({
		where: {
			appealId: appealId,
			whoMissedSiteVisit: { not: null }
		}
	});
};

/**
 *
 * @param {number} id
 * @returns
 */
const getSiteVisitById = (id) => {
	return databaseConnector.siteVisit.findUnique({
		where: {
			id
		},
		include: {
			siteVisitType: true,
			appeal: {
				include: {
					address: true
				}
			}
		}
	});
};

export default {
	createSiteVisitById,
	updateSiteVisitById,
	deleteSiteVisitById,
	getMissedSiteVisitByAppealId,
	getSiteVisitById
};
