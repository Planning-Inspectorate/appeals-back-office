import { stopStoredProcedureTestDatabase } from '#tests/stored-procedures/test-database.js';

export default async () => {
	await stopStoredProcedureTestDatabase();
};
