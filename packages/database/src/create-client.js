import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from './client/client.js';

/** @type {PrismaClient} */
let prismaClient;

export const PrismaCounts = {
	queries: 0
};

/**
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
		prismaConfig.adapter = new PrismaMssql(databaseUrl);

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
			maxWait: 2000,
			timeout: 20000
		};

		// prismaConfig.errorFormat = 'minimal';

		prismaClient = new PrismaClient(prismaConfig);

		if (logger) {
			/** @param {import('./client/client.ts').Prisma.QueryEvent} e */
			const logQuery = (e) => {
				PrismaCounts.queries++;
				logger.debug(
					{ query: e.query, params: e.params, duration: e.duration },
					'Prisma query executed'
				);
			};

			/** @param {import('./client/client.ts').Prisma.LogEvent} e */
			const logError = (e) => logger.error({ e }, 'Prisma error');

			/** @param {import('./client/client.ts').Prisma.LogEvent} e */
			const logInfo = (e) => logger.debug({ e });

			/** @param {import('./client/client.ts').Prisma.LogEvent} e */
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
