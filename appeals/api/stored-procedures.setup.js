import {
	applyStoredProcedureTestEnvironment,
	loadStoredProcedureTestState
} from '#tests/stored-procedures/test-database.js';

process.env.TZ = 'UTC';
applyStoredProcedureTestEnvironment(loadStoredProcedureTestState());
