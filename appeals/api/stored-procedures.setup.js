import {
	applyStoredProcedureTestEnvironment,
	loadStoredProcedureTestState
} from './src/database/stored-procedures/__tests__/test-database.js';

process.env.TZ = 'UTC';
applyStoredProcedureTestEnvironment(loadStoredProcedureTestState());
