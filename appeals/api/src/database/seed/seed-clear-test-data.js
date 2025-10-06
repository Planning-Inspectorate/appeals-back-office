import {
	deleteAppealsInBatches,
	getAppealsFromLpaCodes
} from '#repositories/delete-appeal-data/delete-appeal-data.js';
import { localPlanningDepartmentList } from './LPAs/training.js';

/**
 * @typedef {import('../../server/utils/db-client/index.js').PrismaClient} DatabaseConnector
 */

async function deleteTestRecords() {
	const lpaCodes = localPlanningDepartmentList.map((lpa) => lpa.lpaCode);

	const appeals = await getAppealsFromLpaCodes(lpaCodes);
	if (appeals.length === 0) {
		console.log('Nothing to delete.');
		return;
	}

	await deleteAppealsInBatches(appeals);
}

await deleteTestRecords();
