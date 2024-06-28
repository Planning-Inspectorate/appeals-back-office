/** @typedef {Omit<import('@pins/appeals.api').Schema.LPA, 'id'>} LPA */

/**
 * @param {import('../../server/utils/db-client/index.js').PrismaClient} databaseConnector
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
