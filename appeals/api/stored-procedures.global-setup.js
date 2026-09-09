import { bootstrapStoredProcedureTestDatabase } from './src/database/stored-procedures/__tests__/test-database.js';

export default async () => {
	process.env.TZ = 'UTC';
	await bootstrapStoredProcedureTestDatabase();
};
