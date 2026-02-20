import dotenv from 'dotenv';
dotenv.config();

import { createPrismaClient } from '../create-client.js';
import { seedStaticData } from './data-static.js';
import { localPlanningDepartmentList } from './LPAs/prod.js';
import { mapLpasToTeams } from './map-lpa-and-teams.js';
import { seedLPAs } from './seed-lpas.js';
import { seedTeams } from './seed-teams.js';
import { lpaTeamAssignments, teamsToCreate } from './teams/prod.js';

/**
 * Seed the production database with the required static data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedProduction = async () => {
	const databaseConnector = createPrismaClient();
	try {
		await seedStaticData(databaseConnector, true);
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
