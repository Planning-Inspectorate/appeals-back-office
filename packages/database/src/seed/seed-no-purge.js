import dotenv from 'dotenv';
dotenv.config();

import { createPrismaClient } from '../create-client.js';
import { seedStaticData } from './data-static.js';
import { localPlanningDepartmentList } from './LPAs/dev.js';
import { seedLPAs } from './seed-lpas.js';
import { seedTeams } from './seed-teams.js';
import { teamsToCreate } from './teams/dev.js';

/**
 * Clear the dev database, then add in the static and test data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedWithoutPurge = async () => {
	const databaseConnector = createPrismaClient();
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

await seedWithoutPurge();
