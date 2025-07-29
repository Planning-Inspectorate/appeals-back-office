import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.User} User */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {string} azureAdUserId
 * @returns {PrismaPromise<User>}
 */
const findOrCreateUser = (azureAdUserId) =>
	databaseConnector.user.upsert({
		where: {
			azureAdUserId
		},
		update: {},
		create: {
			azureAdUserId
		}
	});

/**
 * Get users by IDs
 * @param {number[]} ids
 * @returns {PrismaPromise<User[]>}
 */
const getUsersByIds = (ids) => {
	return databaseConnector.user.findMany({
		where: { id: { in: ids } }
	});
};

export default { findOrCreateUser, getUsersByIds };
