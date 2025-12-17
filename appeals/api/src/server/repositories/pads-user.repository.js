import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.PADSUser} PADSUser */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * Get pads users by sapIDs
 * @param {string[]} sapIds
 * @returns {PrismaPromise<PADSUser[]>}
 */
const getPadsUsersByIds = (sapIds) => {
	return databaseConnector.pADSUser.findMany({
		where: { sapId: { in: sapIds } }
	});
};

export default { getPadsUsersByIds };
