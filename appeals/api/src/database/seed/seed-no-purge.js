import { databaseConnector } from '../../server/utils/database-connector.js';
import { seedStaticData } from './data-static.js';
import { localPlanningDepartmentList } from './LPAs/dev.js';
import { mapLpasToTeams } from './map-lpa-and-teams.js';
import { seedLPAs } from './seed-lpas.js';
import { seedTeams } from './seed-teams.js';
import { lpaTeamAssignments, teamsToCreate } from './teams/dev.js';

/**
 * Clear the dev database, then add in the static and test data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedWithoutPurge = async () => {
	try {
		await seedStaticData(databaseConnector);
		await seedTeams(databaseConnector, teamsToCreate);
		const mappedLPAs = mapLpasToTeams(localPlanningDepartmentList, lpaTeamAssignments);
		await seedLPAs(databaseConnector, mappedLPAs);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedWithoutPurge();
