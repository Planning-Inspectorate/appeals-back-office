import dotenv from 'dotenv';

/**
 * @typedef {{database: {connectionString: string}, schedule: {updateBankHolidays: string}, logLevel: (string), NODE_ENV: (string)}} Config
 */

/**
 *
 * @returns Config
 */

export function loadConfig() {
	// load configuration from .env file into process.env
	dotenv.config();

	// get values from the environment
	const { UPDATE_BANK_HOLIDAYS_SCHEDULE, NODE_ENV, SQL_CONNECTION_STRING } = process.env;

	if (!SQL_CONNECTION_STRING) {
		throw new Error('SQL_CONNECTION_STRING is required');
	}

	return {
		database: {
			connectionString: SQL_CONNECTION_STRING
		},
		schedule: {
			updateBankHolidays: UPDATE_BANK_HOLIDAYS_SCHEDULE || '0 0 0 * * *' // default to daily at midnight
		},
		NODE_ENV: NODE_ENV || 'development'
	};
}
