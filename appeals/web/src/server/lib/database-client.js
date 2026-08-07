import config from '#environment/config.js';
import { createPrismaClient } from '@pins/appeals-database/src/create-client.js';

// uncomment to include logging
// import logger from '#lib/logger.js';
// export const databaseConnector = createPrismaClient(config.databaseUrl, logger);
export const dbClient = createPrismaClient(config.databaseUrl);
