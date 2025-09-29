import { databaseConnector } from '../../server/utils/database-connector.js';
import { seedStaticData } from './data-static.js';
import { localPlanningDepartmentList } from './LPAs/training.js';
import { seedLPAs } from './seed-lpas.js';
import { seedTeams } from './seed-teams.js';
import { teamsToCreate } from './teams/training.js';

/** @typedef {import('#utils/db-client/index.js').Prisma.TeamCreateInput} Team */
/** @typedef {Record<string, number|null>} lpaTeamAssignments */
/**
 * Seed the training database with the required static data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedTraining = async () => {
	try {
		await seedStaticData(databaseConnector);
		await seedTeams(databaseConnector, teamsToCreate);
		await seedLPAs(databaseConnector, localPlanningDepartmentList);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedTraining();
