import { databaseConnector } from '../../server/utils/database-connector.js';
import { seedStaticData } from './data-static.js';
import { seedLPAs } from './seed-lpas.js';
import { localPlanningDepartmentList } from './LPAs/prod.js';
import { seedTeams } from './seed-teams.js';
import { teamsToCreate, lpaTeamAssignments } from '../teams/prod.js';
import { mapLpasToTeams } from './map-lpa-and-teams.js';

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
		const mappedLPAs = mapLpasToTeams(localPlanningDepartmentList, lpaTeamAssignments);
		await seedLPAs(databaseConnector, mappedLPAs);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedProduction();
