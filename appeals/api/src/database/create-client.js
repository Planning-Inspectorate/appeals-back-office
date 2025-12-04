import { PrismaClient } from '#db-client';

/** @type {PrismaClient} */
let prismaClient;

/**
 * @param {import('pino').Logger} [logger]
 * @returns {PrismaClient}
 */
export const createPrismaClient = (logger) => {
	if (!prismaClient) {
		prismaClient = new PrismaClient({
			log: [
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
			]
		});

		if (logger) {
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
	}

	return prismaClient;
};
