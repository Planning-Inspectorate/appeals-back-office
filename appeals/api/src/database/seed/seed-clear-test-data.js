// import { databaseConnector } from '../../server/utils/database-connector.js';
import {
	// deleteAppealsInBatches,
	getAppealsFromLpaCodes
} from '../../server/repositories/delete-appeal-data/delete-appeal-data.js';
// } from '#repositories/delete-appeal-data/delete-appeal-data.js';
import logger from '#utils/logger.js';
import { localPlanningDepartmentList } from './LPAs/training.js';

/**
 * @typedef {import('../../server/utils/db-client/index.js').PrismaClient} DatabaseConnector
 */

async function deleteTestRecords() {
	const lpaCodes = localPlanningDepartmentList.map((lpa) => lpa.lpaCode);

	const appeals = await getAppealsFromLpaCodes(lpaCodes);
	if (appeals.length === 0) {
		logger.info('Nothing to delete.');
		return;
	}

	console.log(appeals);

	// await deleteAppealsInBatches(appeals);
}

await deleteTestRecords();
