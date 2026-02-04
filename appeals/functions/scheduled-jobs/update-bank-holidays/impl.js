import sql from 'mssql';

const BANK_HOLIDAYS_URL = 'https://www.gov.uk/bank-holidays.json';

/**
 *
 * @type {import('@azure/functions').TimerHandler}
 */
export function updateBankHolidays(service) {
	return async (timer, context) => {
		try {
			context.log('Fetching bank holidays from GOV UK');
			const response = await fetch(BANK_HOLIDAYS_URL);

			if (!response.ok) {
				throw new Error(
					`Unable to fetch bank holidays from GOV UK (HTTP response ${response.status})`
				);
			}

			const data = await response.json();
			const today = new Date();
			today.setUTCHours(0, 0, 0, 0);
			const futureBankHolidays = data['england-and-wales'].events.filter(
				(event) => new Date(event.date) > today
			);
			const allowedDates = [];

			context.log('Fetched bank holidays');

			const connectionPool = await sql.connect(service.databaseConnectionString);
			const transaction = new sql.Transaction(connectionPool);
			await transaction.begin();

			// Upsert future bank holidays in database
			const tempTable = new sql.Table('#TempTable');
			tempTable.create = true;
			tempTable.columns.add('bankHolidayDate', sql.DateTime);
			tempTable.columns.add('title', sql.VarChar(1000));
			futureBankHolidays.forEach((bankHoliday) => {
				const date = new Date(bankHoliday.date);
				allowedDates.push(date);
				tempTable.rows.add(date, bankHoliday.title);
			});

			await transaction.request().bulk(tempTable);
			await transaction.request().query(`
				MERGE BankHoliday AS target
				USING #TempTable AS source
					ON target.bankHolidayDate = source.bankHolidayDate
				WHEN NOT MATCHED THEN
					INSERT (bankHolidayDate, title)
					VALUES (source.bankHolidayDate, source.title)
				WHEN MATCHED THEN
					UPDATE SET
						title = source.title;
			`);

			// Remove cancelled future bank holidays
			const request = new sql.Request(transaction);
			const params = allowedDates
				.map((date, i) => {
					const inputName = `date${i}`;
					request.input(inputName, sql.DateTime, date);
					return `@${inputName}`;
				})
				.join(',');
			request.input('today', sql.DateTime, today);
			await request.query(`
				DELETE FROM BankHoliday
				WHERE bankHolidayDate > @today AND bankHolidayDate NOT IN (${params})
			`);

			await transaction.commit();
			context.log('Bank holidays updated successfully');
		} catch (error) {
			let message;
			if (error instanceof Error) {
				context.log('Error during fetching bank holidays run: ', error);
				message = error.message;
			}

			throw new Error('Error during fetching bank holidays run: ' + message);
		}
	};
}
