/**
 * instance of prisma client with logger attached
 */
// import logger from '#utils/logger.js';
import { createPrismaClient } from '../../database/create-client.js';

// export const databaseConnector = createPrismaClient(logger); // use for logging
export const databaseConnector = createPrismaClient();
