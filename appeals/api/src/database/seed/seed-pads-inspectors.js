/** @typedef {import('#db-client/models.ts').PADSUserCreateInput} PADSUser */

/**
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 * @param {PADSUser[]} seed
 */
export const seedPADSInspectors = async (databaseConnector, seed) => {
	for (const padUser of seed) {
		await databaseConnector.pADSUser.upsert({
			create: padUser,
			where: { sapId: padUser.sapId },
			update: padUser
		});
	}
};
