import {
	deleteAppealsInBatches,
	getAppealsFromLpaCodes
} from '#repositories/delete-appeal-data/delete-appeal-data.js';
import logger from '#utils/logger.js';
import { localPlanningDepartmentList } from './LPAs/training.js';

/**
 * @typedef {import('../../server/utils/db-client/index.js').PrismaClient} DatabaseConnector
 */

async function deleteTestRecords() {
	process.env.NODE_ENV = '';

	const lpaCodes = localPlanningDepartmentList.map((lpa) => lpa.lpaCode);

	const appeals = await getAppealsFromLpaCodes(lpaCodes);
	if (appeals.length === 0) {
		logger.info('Nothing to delete.');
		return;
	}

	await deleteAppealsInBatches(appeals);
}

await deleteTestRecords();
