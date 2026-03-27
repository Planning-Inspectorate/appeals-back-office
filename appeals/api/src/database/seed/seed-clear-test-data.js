import appealDataFns from '#repositories/delete-appeal-data/delete-appeal-data.js';

const IS_DRY_RUN_ONLY =
	!process.env.DRY_RUN_ONLY || process.env.DRY_RUN_ONLY.toLowerCase() !== 'false';
const MAX_EXPECTED_CASES_TO_DELETE =
	parseInt(process.env.MAX_EXPECTED_CASES_TO_DELETE ?? '0') || Number.MAX_SAFE_INTEGER;

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

	// check if the number of cases to delete exceeds the maximum expected, and log a warning if so
	// - this is to help prevent accidental deletion of large numbers of cases if the test LPA codes are not correct
	if (appealsToDelete.length > MAX_EXPECTED_CASES_TO_DELETE) {
		console.warn(
			`WARNING: Deleting test cases abandoned - the number of test cases to delete (${appealsToDelete.length}) exceeds the maximum expected (${MAX_EXPECTED_CASES_TO_DELETE}).`
		);
		return;
	}

	// If this is a dry run, log the cases that would be deleted, but do not actually delete them
	if (IS_DRY_RUN_ONLY) {
		console.info(
			`Deleting test cases - DRY RUN ONLY - the following ${appealsToDelete.length} cases would be deleted:`
		);
		console.info(
			'Appeal references that would be deleted:',
			appealsToDelete.map((a) => a.reference)
		);
	} else {
		// this is not a dry run, proceed to really delete the cases
		console.info(`Deleting test cases - total: ${appealsToDelete.length} ...`);
		console.info(
			'Appeal references to be deleted:',
			appealsToDelete.map((a) => a.reference)
		);
		await appealDataFns.deleteAppealsInBatches(appealsToDelete);
	}
	console.info(`Deleting test cases - completed.`);
}

await deleteTestRecords();
