import { databaseConnector } from '../../server/utils/database-connector.js';
import { addAssignedTeamIdToAppeal } from './add-assigned-team-id.js';
import { seedStaticData } from './data-static.js';
import { seedTestData } from './data-test.js';
import { localPlanningDepartmentList } from './LPAs/dev.js';
import { mapLpasToTeams } from './map-lpa-and-teams.js';
import { deleteAllRecords } from './seed-clear.js';
import { seedLPAs } from './seed-lpas.js';
import { seedTeams } from './seed-teams.js';
import { lpaTeamAssignments, teamsToCreate } from './teams/dev.js';

/**
 * Clear the dev database, then add in the static and test data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedDevelopment = async () => {
	try {
		await deleteAllRecords(databaseConnector);
		await seedStaticData(databaseConnector);
		await seedTestData(databaseConnector);
		await seedTeams(databaseConnector, teamsToCreate);
		const mappedLPAs = mapLpasToTeams(localPlanningDepartmentList, lpaTeamAssignments);
		await seedLPAs(databaseConnector, mappedLPAs);
		await addAssignedTeamIdToAppeal(databaseConnector);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedDevelopment();
