import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.Ground} Ground */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @returns {PrismaPromise<Ground[]>}
 */
export const getAllGrounds = () => {
	return databaseConnector.ground.findMany();
};
