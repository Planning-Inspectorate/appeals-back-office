import { bootstrapStoredProcedureTestDatabase } from '#tests/stored-procedures/test-database.js';

export default async () => {
	process.env.TZ = 'UTC';
	await bootstrapStoredProcedureTestDatabase();
};
