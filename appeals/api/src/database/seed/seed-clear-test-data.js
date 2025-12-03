import appealDataFns from '#repositories/delete-appeal-data/delete-appeal-data.js';
import { localPlanningDepartmentList } from './LPAs/training.js';

/**
 * @typedef {import('#db-client/client.ts').PrismaClient} DatabaseConnector
 */

async function deleteTestRecords() {
	const lpaCodes = localPlanningDepartmentList.map((lpa) => lpa.lpaCode);

	const appeals = await appealDataFns.getAppealsFromLpaCodes(lpaCodes);
	if (appeals.length === 0) {
		console.info('Nothing to delete.');
		return;
	}

	await appealDataFns.deleteAppealsInBatches(appeals);
}

await deleteTestRecords();
