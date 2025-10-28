import { databaseConnector } from '../../server/utils/database-connector.js';
import { addAssignedTeamIdToAppeal } from './add-assigned-team-id.js';
import { seedStaticData } from './data-static.js';
import { seedTestData } from './data-test.js';
import { localPlanningDepartmentList } from './LPAs/dev.js';
import { seedLPAs } from './seed-lpas.js';
import { seedTeams } from './seed-teams.js';
import { dropFksTruncateRecreateFks } from './seed-truncate.js';
import { teamsToCreate } from './teams/dev.js';

/**
 * Clear the dev database, then add in the static and test data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedDevelopment = async () => {
	try {
		await dropFksTruncateRecreateFks(databaseConnector);
		console.info('Cleared existing records from development database');
		await seedTeams(databaseConnector, teamsToCreate);
		console.info('Seeded teams into development database');
		await seedLPAs(databaseConnector, localPlanningDepartmentList);
		console.info('Seeded LPAs into development database');
		await seedStaticData(databaseConnector);
		console.info('Seeded static data into development database');
		await seedTestData(databaseConnector);
		console.info('Seeded test data into development database');
		await addAssignedTeamIdToAppeal(databaseConnector);
		console.info('Updated appeals with assigned team IDs');
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedDevelopment();
