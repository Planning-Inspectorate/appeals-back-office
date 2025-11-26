import { PrismaClient } from '#db-client';
import logger from '#utils/logger.js';
import { PrismaMssql } from '@prisma/adapter-mssql';

/** @type {PrismaClient} */
let prismaClient;

/**
 * @returns {PrismaClient}
 */
function createPrismaClient() {
	if (!prismaClient) {
		/** @type {prismaConfig} */
		const prismaConfig = {};

		if (!process.env.DATABASE_URL) {
			throw new Error('connectionString not provided to create Prisma Client');
		}

		prismaConfig.adapter = new PrismaMssql(process.env.DATABASE_URL);

		prismaConfig.log = [
			{
				emit: 'event',
				level: 'query'
			},
			{
				emit: 'event',
				level: 'error'
			}
			// {
			// 	emit: 'event',
			// 	level: 'info'
			// },
			// {
			// 	emit: 'event',
			// 	level: 'warn'
			// }
		];

		prismaClient = new PrismaClient(prismaConfig);

		/** @param {import('#db-client').Prisma.QueryEvent} e */
		const logQuery = (e) => {
			logger.debug(
				{ query: e.query, params: e.params, duration: e.duration },
				'Prisma query executed'
			);
		};

		/** @param {import('#db-client').Prisma.LogEvent} e */
		const logError = (e) => logger.error({ e }, 'Prisma error');

		/** @param {import('#db-client').Prisma.LogEvent} e */
		const logInfo = (e) => logger.debug({ e });

		/** @param {import('#db-client').Prisma.LogEvent} e */
		const logWarn = (e) => logger.warn({ e });

		// @ts-ignore
		prismaClient.$on('query', logQuery);
		// @ts-ignore
		prismaClient.$on('error', logError);
		// @ts-ignore
		prismaClient.$on('info', logInfo);
		// @ts-ignore
		prismaClient.$on('warn', logWarn);
	}

	return prismaClient;
}

export const databaseConnector = createPrismaClient();
