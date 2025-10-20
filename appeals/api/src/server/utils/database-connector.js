import { PrismaClient } from '#db-client';
import { initialisePrismaInstrumentation } from './prisma-instrumentation.js';

/** @type {PrismaClient} */
let prismaClient;

/**
 * @returns {PrismaClient}
 */
function createPrismaClient() {
	if (!prismaClient) {
		prismaClient = new PrismaClient();
	}

	initialisePrismaInstrumentation();
	return prismaClient;
}

export const databaseConnector = createPrismaClient();
