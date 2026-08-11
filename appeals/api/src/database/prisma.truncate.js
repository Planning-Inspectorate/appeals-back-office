import { loadEnvFile } from 'node:process';
// prettier-ignore
try { loadEnvFile(); } catch {/* ignore errors*/}

import { createPrismaClient } from './create-client.js';

/**
 * Truncates a table in the DB, removing all data.
 * Useful as DeleteMany cannot delete > 2100 rows.
 * Azure MS SQL version
 *
 * @param {string} tableName
 * @returns {Promise<any>}
 */
export const truncateTable = async (tableName) => {
	const databaseConnector = createPrismaClient();
	await databaseConnector.$queryRawUnsafe(`TRUNCATE TABLE "${tableName}";`);
};
