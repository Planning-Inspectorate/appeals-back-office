import { PrismaClient } from '#db-client/client.js';
import { PrismaMssql } from '@prisma/adapter-mssql';

/** @type {PrismaClient} */
let prismaClient;

/**
 * @param {string | undefined} databaseUrl
 * @param {import('pino').Logger} [logger]
 * @returns {PrismaClient}
 */
export const createPrismaClient = (databaseUrl = process.env.DATABASE_URL, logger) => {
	if (!prismaClient) {
		/** @type {prismaConfig} */
		const prismaConfig = {};

		if (!databaseUrl) {
			throw new Error('connectionString not provided to create Prisma Client.');
		}
		prismaConfig.adapter = new PrismaMssql(`${databaseUrl};connection_limit=8;`);
		// prismaConfig.adapter = new PrismaMssql(`${databaseUrl};`);

		prismaConfig.log = [
			{
				emit: 'event',
				level: 'query'
			},
			{
				emit: 'event',
				level: 'error'
			},
			{
				emit: 'event',
				level: 'info'
			},
			{
				emit: 'event',
				level: 'warn'
			}
		];

		prismaConfig.transactionOptions = {
			// maxWait: 5000,
			timeout: 20000
			// pool: {
			// 	max: 20
			// }
		};

		// prismaConfig.errorFormat = 'minimal';

		prismaClient = new PrismaClient(prismaConfig);

		if (logger) {
			/** @param {import('#db-client/client.ts').Prisma.QueryEvent} e */
			const logQuery = (e) => {
				logger.debug(
					{ query: e.query, params: e.params, duration: e.duration },
					'Prisma query executed'
				);
			};

			/** @param {import('#db-client/client.ts').Prisma.LogEvent} e */
			const logError = (e) => logger.error({ e }, 'Prisma error');

			/** @param {import('#db-client/client.ts').Prisma.LogEvent} e */
			const logInfo = (e) => logger.debug({ e });

			/** @param {import('#db-client/client.ts').Prisma.LogEvent} e */
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
	}

	return prismaClient;
};
