import { databaseConnector } from '#utils/database-connector.js';

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
