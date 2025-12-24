/**
 * instance of prisma client with logger attached
 */
// import logger from '#utils/logger.js';
import config from '#config/config.js';
import { createPrismaClient } from '../../database/create-client.js';

// export const databaseConnector = createPrismaClient(config.DATABASE_URL, logger); // use for logging
export const databaseConnector = createPrismaClient(config.DATABASE_URL);
