import { databaseConnector } from '../../server/utils/database-connector.js';
import { seedStaticData } from './data-static.js';
import { seedLPAs } from './seed-lpas.js';
import { localPlanningDepartmentList } from './LPAs/prod.js';

/**
 * Seed the production database with the required static data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedProduction = async () => {
	try {
		await seedStaticData(databaseConnector);
		await seedLPAs(databaseConnector, localPlanningDepartmentList);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedProduction();
