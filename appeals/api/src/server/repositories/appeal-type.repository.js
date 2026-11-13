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

/**
 * @param { number | string } idOrKey
 * @param { boolean } suppressNotifications
 * @returns {Promise<AppealType>}
 */
export const updateAppealTypeNotifySuppression = async (idOrKey, suppressNotifications) => {
	const where =
		typeof idOrKey === 'number' || !isNaN(Number(idOrKey))
			? { id: Number(idOrKey) }
			: { key: String(idOrKey) };

	const result = await databaseConnector.appealType.update({
		where,
		data: { suppressNotifications }
	});

	if (redisClient) {
		await redisClient.invalidate(`lookup-appealType`);
	}

	return result;
};
