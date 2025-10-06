import { databaseConnector } from '../../server/utils/database-connector.js';
import { seedStaticData } from './data-static.js';
import { localPlanningDepartmentList } from './LPAs/prod.js';
import { seedLPAs } from './seed-lpas.js';
import { seedPersonalList } from './seed-personal-list.js';
import { seedTeams } from './seed-teams.js';
import { teamsToCreate } from './teams/prod.js';

/**
 * Seed the production database with the required static data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedProduction = async () => {
	try {
		await seedStaticData(databaseConnector);
		await seedTeams(databaseConnector, teamsToCreate);
		await seedLPAs(databaseConnector, localPlanningDepartmentList);
		await seedPersonalList(databaseConnector);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedProduction();
