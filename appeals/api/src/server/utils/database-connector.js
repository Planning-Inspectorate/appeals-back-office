import { PrismaClient } from '#db-client';

/** @type {PrismaClient} */
let prismaClient;

/**
 * @returns {PrismaClient}
 */
function createPrismaClient() {
	if (!prismaClient) {
		prismaClient = new PrismaClient({
			log: ['query']
		});
	}

	return prismaClient;
}

export const databaseConnector = createPrismaClient();
