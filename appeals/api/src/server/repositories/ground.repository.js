import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.Ground} Ground */
/**
 * @typedef {import('@pins/appeals-database/src/client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @returns {PrismaPromise<Ground[]>}
 */
export const getAllGrounds = () => {
	return databaseConnector.ground.findMany();
};
