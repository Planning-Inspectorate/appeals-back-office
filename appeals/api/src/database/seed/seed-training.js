import { databaseConnector } from '../../server/utils/database-connector.js';
import { seedStaticData } from './data-static.js';
import { seedLPAs } from './seed-lpas.js';
import { localPlanningDepartmentList } from './LPAs/training.js';
import { deleteAllRecords } from './seed-clear.js';

/**
 * Seed the training database with the required static data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedTraining = async () => {
	try {
		await deleteAllRecords(databaseConnector);
		await seedStaticData(databaseConnector);
		await seedLPAs(databaseConnector, localPlanningDepartmentList);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedTraining();
