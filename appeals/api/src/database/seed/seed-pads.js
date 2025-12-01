/** @typedef {import('#utils/db-client/index.js').Prisma.PADUsersCreateInput} PADUsers */

/**
 * @param {import('../../server/utils/db-client/index.js').PrismaClient} databaseConnector
 * @param {PADUsers[]} seed
 */
export const seedPADs = async (databaseConnector, seed) => {
	for (const pad of seed) {
		await databaseConnector.pADUsers.upsert({
			create: pad,
			where: { sapId: pad.sapId },
			update: pad
		});
	}
};
