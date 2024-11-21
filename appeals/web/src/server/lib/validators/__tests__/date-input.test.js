import { validationResult } from 'express-validator';
import { createRequest, createResponse } from 'node-mocks-http';
import { testExpressValidatorMiddleware } from '#testing/util/validator.js';
import { createDateInputFieldsValidator } from '../date-input.validator.js';

/**
 * @param {any} validator
 * @param {any} body
 * */
async function runValidator(validator, body) {
	const req = createRequest({
		method: 'POST',
		url: 'https://localhost/',
		secure: false,
		headers: {
			host: 'localhost'
		},
		body
	});

	const res = createResponse();

	await testExpressValidatorMiddleware(req, res, [validator]);
	return validationResult(req);
}

describe('Date input fields validator', () => {
	describe('Test whole body', () => {
		const validator = createDateInputFieldsValidator();

		it('Should return no errors when day, month and year are all valid', async () => {
			const result = await runValidator(validator, {
				'date-day': 1,
				'date-month': 1,
				'date-year': 2024
			});

			expect(result.isEmpty()).toBe(true);
		});

		it('Should return an error when the day is missing', async () => {
			const result = await runValidator(validator, {
				'date-month': 1,
				'date-year': 2024
			});

			expect(result.isEmpty()).toBe(false);
			expect(result.array()[0]?.msg).toBe('Date must include a day');
		});

		it('Should return an error when the month is missing', async () => {
			const result = await runValidator(validator, {
				'date-day': 1,
				'date-year': 2024
			});

			expect(result.isEmpty()).toBe(false);
			expect(result.array()[0]?.msg).toBe('Date must include a month');
		});

		it('Should return an error when the year is missing', async () => {
			const result = await runValidator(validator, {
				'date-day': 1,
				'date-month': 1
			});

			expect(result.isEmpty()).toBe(false);
			expect(result.array()[0]?.msg).toBe('Date must include a year');
		});

		it('Should combine errors when multiple fields are missing', async () => {
			const result1 = await runValidator(validator, {
				'date-year': 2024
			});

			expect(result1.isEmpty()).toBe(false);
			expect(result1.array()[0]?.msg).toBe('Date must include a day and a month');

			const result2 = await runValidator(validator, {
				'date-month': 1
			});

			expect(result2.isEmpty()).toBe(false);
			expect(result2.array()[0]?.msg).toBe('Date must include a day and a year');

			const result3 = await runValidator(validator, {});

			expect(result3.isEmpty()).toBe(false);
			expect(result3.array()[0]?.msg).toBe('Date must include a day, a month and a year');
		});
	});

	describe('Test nested field in body', () => {
		const validator = createDateInputFieldsValidator(
			'date',
			'date',
			'-day',
			'-month',
			'-year',
			'foo.*.bar'
		);

		it('Should run once for each item in the foo array', async () => {
			const result = await runValidator(validator, {
				foo: [
					{
						bar: {
							'date-month': 1,
							'date-year': 2024
						}
					},
					{
						bar: {
							'date-day': 1,
							'date-month': 1,
							'date-year': 2024
						}
					},
					{
						bar: {}
					}
				]
			});

			expect(result.isEmpty()).toBe(false);

			const errors = result.array();
			expect(errors[0]?.msg).toBe('Date must include a day');
			expect(errors[1]?.msg).toBe('Date must include a day, a month and a year');
		});
	});
});
