import dotenv from 'dotenv';
dotenv.config();

import { createPrismaClient } from '../create-client.js';
import { addAssignedTeamIdToAppeal } from './add-assigned-team-id.js';
import { seedStaticData } from './data-static.js';
import { seedTestData } from './data-test.js';
import { localPlanningDepartmentList } from './LPAs/dev.js';
import { padsInspectorList } from './PADs/dev.js';
import { seedLPAs } from './seed-lpas.js';
import { seedPADSInspectors } from './seed-pads-inspectors.js';
import { seedTeams } from './seed-teams.js';
import { deleteExistingData } from './seed-truncate.js';
import { teamsToCreate } from './teams/dev.js';

/**
 * Clear the dev database, then add in the static and test data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedDevelopment = async () => {
	const databaseConnector = createPrismaClient();
	try {
		await deleteExistingData(databaseConnector);
		console.info('Cleared existing records from development database\n');
		await seedTeams(databaseConnector, teamsToCreate);
		console.info('Seeded teams into development database\n');
		await seedLPAs(databaseConnector, localPlanningDepartmentList);
		console.info('Seeded LPAs into development database\n');
		await seedPADSInspectors(databaseConnector, padsInspectorList);
		console.info('Seeded PADS Inspectors into development database\n');
		await seedStaticData(databaseConnector);
		console.info('Seeded static data into development database\n');
		await seedTestData(databaseConnector);
		console.info('Seeded test data into development database\n');
		await addAssignedTeamIdToAppeal(databaseConnector);
		console.info('Updated appeals with assigned team IDs\n');
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedDevelopment();
