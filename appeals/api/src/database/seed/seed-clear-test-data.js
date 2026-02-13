import appealDataFns from '#repositories/delete-appeal-data/delete-appeal-data.js';

/** @typedef {import('#utils/db-client/models.ts').LPACreateInput} LPA */
/** @typedef {import('#utils/db-client/client.ts').PrismaClient} DatabaseConnector  */

/**
 * This is a list of "Test LPAs" that are used in test cases. If any of these LPAs are found in the database, then the associated cases and all related records will be deleted.
 *
 * @returns {LPA[]}
 */
const testLpasForDeleteCases = [
	{
		lpaCode: 'Q9999',
		name: 'System Test Borough Council',
		email: 'appealplanningdecisiontest@planninginspectorate.gov.uk',
		teamId: 10000001 // Ops Test
	},
	{
		lpaCode: 'Q1111',
		name: 'System Test Borough Council 2',
		email: 'appealplanningdecisiontest@planninginspectorate.gov.uk',
		teamId: 10000001 // Ops Test
	}
];

/**
 * Deletes all cases and related records which have the "Test LPAs" assigned
 *
 * @returns {Promise<void>}
 */
async function deleteTestRecords() {
	const lpaCodes = testLpasForDeleteCases.map((lpa) => lpa.lpaCode);

	const appealsToDelete = await appealDataFns.getAppealsFromLpaCodes(lpaCodes);
	if (appealsToDelete.length === 0) {
		console.info('Deleting test cases - no test cases found to delete.');
		return;
	}

	console.info(`Deleting test cases - total: ${appealsToDelete.length} ...`);
	await appealDataFns.deleteAppealsInBatches(appealsToDelete);
	console.info(`Deleting test cases - completed.`);
}

await deleteTestRecords();
