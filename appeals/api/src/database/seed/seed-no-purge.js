import { databaseConnector } from '../../server/utils/database-connector.js';
import { seedStaticData } from './data-static.js';

/**
 * Clear the dev database, then add in the static and test data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedWithoutPurge = async () => {
	try {
		await seedStaticData(databaseConnector);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedWithoutPurge();
