export class FunctionService {
	/**
	 * @private
	 */
	#config;
	dbClient;

	constructor(config) {
		this.#config = config;
	}

	get updateBankHolidaysSchedule() {
		return this.#config.schedule.updateBankHolidays;
	}

	get databaseConnectionString() {
		return this.#config.database.connectionString;
	}
}
