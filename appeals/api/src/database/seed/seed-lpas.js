/** @typedef {import('#db-client/models.ts').LPACreateInput} LPA */

/**
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 * @param {LPA[]} seed
 */
export const seedLPAs = async (databaseConnector, seed) => {
	for (const lpa of seed) {
		await databaseConnector.lPA.upsert({
			create: lpa,
			where: { lpaCode: lpa.lpaCode },
			update: lpa
		});
	}
};
