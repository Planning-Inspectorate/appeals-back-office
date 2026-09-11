import { stopStoredProcedureTestDatabase } from './src/database/stored-procedures/__tests__/test-database.js';

export default async () => {
	await stopStoredProcedureTestDatabase();
};
