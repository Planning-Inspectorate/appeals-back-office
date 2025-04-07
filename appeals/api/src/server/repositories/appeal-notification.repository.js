import { databaseConnector } from '#utils/database-connector.js';

/**
 * @param {import('#db-client').Prisma.AppealNotificationCreateManyInput[]} data
 */
export const createAppealNotifications = (data) =>
	databaseConnector.appealNotification.createMany({
		data
	});

/**
 *
 * @param {string} caseReference
 * @returns {Promise<import('@pins/appeals.api').Schema.AppealNotification[]>}
 */
export const getAppealNotifications = async (caseReference) =>
	databaseConnector.appealNotification.findMany({
		where: { caseReference },
		orderBy: { dateCreated: 'desc' }
	});
