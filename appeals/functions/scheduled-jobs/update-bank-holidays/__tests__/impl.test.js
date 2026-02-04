import assert from 'node:assert';
import { describe, mock, test } from 'node:test';

describe('update-bank-holidays', () => {
	const mockRequest = {
		input: mock.fn(),
		query: mock.fn(),
		bulk: mock.fn()
	};
	mockRequest.query.mock.mockImplementation(() => {
		return this;
	});

	const mockTransaction = {
		begin: mock.fn(),
		commit: mock.fn(),
		request: mock.fn()
	};
	mockTransaction.request.mock.mockImplementation(() => {
		return mockRequest;
	});

	const mockTable = {
		columns: {
			add: mock.fn()
		},
		rows: {
			add: mock.fn()
		}
	};

	const mockMssql = {
		connect: mock.fn(),
		Table: mock.fn(),
		Request: mock.fn(),
		Transaction: mock.fn(),
		VarChar: mock.fn(),
		DateTime: mock.fn()
	};
	mockMssql.connect.mock.mockImplementation(() => {
		return {};
	});
	mockMssql.Table.mock.mockImplementation(function () {
		return mockTable;
	});
	mockMssql.Request.mock.mockImplementation(function () {
		return mockRequest;
	});
	mockMssql.Transaction.mock.mockImplementation(function () {
		return mockTransaction;
	});

	mock.module('mssql', {
		namedExports: mockMssql
	});

	const service = {};

	test('should update bank holidays table', async (ctx) => {
		ctx.mock.timers.enable({
			apis: ['Date'],
			now: new Date('2023-10-04T12:00:00Z')
		});

		let updateBankHolidaysImport = await import('../impl.js');

		global.fetch = async () => ({
			ok: true,
			json: async () => ({
				'england-and-wales': {
					events: [
						{ date: '2023-10-04', title: 'Bank Holiday 1' },
						{ date: '2023-10-03', title: 'Bank Holiday 2' },
						{ date: '2023-10-05', title: 'Bank Holiday 3' },
						{ date: '2024-10-04', title: 'Bank Holiday 4' }
					]
				}
			})
		});

		const handler = updateBankHolidaysImport.updateBankHolidays(service);
		await handler({}, { log: console.log });

		assert.strictEqual(mockTransaction.begin.mock.callCount(), 1);
		assert.strictEqual(mockTransaction.commit.mock.callCount(), 1);
		assert.strictEqual(mockTable.columns.add.mock.callCount(), 2);
		assert.strictEqual(mockTable.rows.add.mock.callCount(), 2);
		assert.deepStrictEqual(mockTable.rows.add.mock.calls[0].arguments[0], new Date('2023-10-05'));
		assert.strictEqual(mockTable.rows.add.mock.calls[0].arguments[1], 'Bank Holiday 3');
		assert.deepStrictEqual(mockTable.rows.add.mock.calls[1].arguments[0], new Date('2024-10-04'));
		assert.strictEqual(mockTable.rows.add.mock.calls[1].arguments[1], 'Bank Holiday 4');
		assert.strictEqual(mockRequest.query.mock.callCount(), 2);
		assert.strictEqual(
			mockRequest.query.mock.calls[0].arguments[0],
			`
				MERGE BankHoliday AS target
				USING #TempTable AS source
					ON target.bankHolidayDate = source.bankHolidayDate
				WHEN NOT MATCHED THEN
					INSERT (bankHolidayDate, title)
					VALUES (source.bankHolidayDate, source.title)
				WHEN MATCHED THEN
					UPDATE SET
						title = source.title;
			`
		);
		assert.strictEqual(
			mockRequest.query.mock.calls[1].arguments[0],
			`
				DELETE FROM BankHoliday
				WHERE bankHolidayDate > @today AND bankHolidayDate NOT IN (@date0,@date1)
			`
		);
	});

	test('should handle error if fail to fetch bank holidays', async () => {
		global.fetch = async () => ({
			ok: false
		});
		let updateBankHolidaysImport = await import('../impl.js');
		const handler = updateBankHolidaysImport.updateBankHolidays(service);
		await assert.rejects(() => handler({}, { log: console.log }));
	});
});
