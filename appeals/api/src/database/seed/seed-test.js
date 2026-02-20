import dotenv from 'dotenv';
dotenv.config();

import { createPrismaClient } from '../create-client.js';
import { seedStaticData } from './data-static.js';
import { localPlanningDepartmentList } from './LPAs/dev.js';
import { padsInspectorList } from './PADs/dev.js';
import { seedLPAs } from './seed-lpas.js';
import { seedPADSInspectors } from './seed-pads-inspectors.js';
import { seedTeams } from './seed-teams.js';
import { deleteExistingData } from './seed-truncate.js';
import { teamsToCreate } from './teams/dev.js';

/**
 * Clear the test database, then add in the minimum test data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedTest = async () => {
	const databaseConnector = createPrismaClient();
	try {
		await deleteExistingData(databaseConnector);
		await seedTeams(databaseConnector, teamsToCreate);
		await seedLPAs(databaseConnector, localPlanningDepartmentList);
		await seedPADSInspectors(databaseConnector, padsInspectorList);
		await seedStaticData(databaseConnector, false);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedTest();
