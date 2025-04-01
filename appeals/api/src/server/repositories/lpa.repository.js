import { databaseConnector } from '#utils/database-connector.js';

/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */
/** @typedef {import('@pins/appeals.api').Schema.LPA} LPA */

/**
 * Gets LPA details by ID
 * @param {number} id
 * @returns {PrismaPromise<LPA|null>}
 */
const getLpaById = (id) => {
	return databaseConnector.lPA.findUnique({ where: { id } });
};

export default {
	getLpaById
};
