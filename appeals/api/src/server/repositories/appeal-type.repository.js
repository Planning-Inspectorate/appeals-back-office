import redisClient from '#infrastructure/redis.js';
import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @returns {Promise<AppealType[]>}
 */
export const getAllAppealTypes = () => {
	const getAppealTypes = () => databaseConnector.appealType.findMany();
	if (!redisClient) {
		return getAppealTypes();
	}
	const cacheKey = `lookup-appealType`;
	const cacheTimeInSeconds = 600;

	return redisClient.getOrSet(cacheKey, cacheKey, cacheTimeInSeconds, getAppealTypes);
};

/**
 * @param { number } typeId
 * @returns {PrismaPromise<AppealType|null>}
 */
export const getAppealTypeByTypeId = (typeId) => {
	return databaseConnector.appealType.findFirst({
		where: { id: typeId }
	});
};
