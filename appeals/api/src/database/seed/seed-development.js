import { databaseConnector } from '../../server/utils/database-connector.js';
import { addAssignedTeamIdToAppeal } from './add-assigned-team-id.js';
import { seedStaticData } from './data-static.js';
import { seedTestData } from './data-test.js';
import { localPlanningDepartmentList } from './LPAs/dev.js';
import { deleteAllRecords } from './seed-clear.js';
import { seedLPAs } from './seed-lpas.js';
import { seedPersonalList } from './seed-personal-list.js';
import { seedTeams } from './seed-teams.js';
import { teamsToCreate } from './teams/dev.js';

/**
 * Clear the dev database, then add in the static and test data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedDevelopment = async () => {
	try {
		await deleteAllRecords(databaseConnector);
		await seedTeams(databaseConnector, teamsToCreate);
		await seedLPAs(databaseConnector, localPlanningDepartmentList);
		await seedStaticData(databaseConnector);
		await seedTestData(databaseConnector);
		await seedPersonalList(databaseConnector);
		await addAssignedTeamIdToAppeal(databaseConnector);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedDevelopment();
