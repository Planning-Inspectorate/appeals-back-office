import { validationResult } from 'express-validator';
import { createTimeInputValidator } from '../time-input.validator.js';

// @ts-ignore
const run = (mw, body = {}) =>
	new Promise((resolve, reject) => {
		const req = { body };
		const res = {};
		// @ts-ignore
		mw(req, res, (err) => {
			if (err) return reject(err);
			resolve(validationResult(req).array());
		});
	});

describe('createTimeInputValidator', () => {
	const fieldNamePrefix = 'hearing-time';
	const label = 'hearing time';

	test('errors when BOTH hour and minute are missing', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);
		const errors = await run(mw, {
			// no `${fieldNamePrefix}-hour` and no `${fieldNamePrefix}-minute`
		});

		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe(`Enter the ${label}`);
		expect(errors[0].path).toBe(`${fieldNamePrefix}-hour`);
	});

	test('errors when hour is missing but minute present', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);
		const errors = await run(mw, {
			[`${fieldNamePrefix}-minute`]: '30'
		});

		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe('Hearing time must include an hour');
	});

	test('errors when minute is missing but hour present', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);
		const errors = await run(mw, {
			[`${fieldNamePrefix}-hour`]: '10'
		});

		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe('Hearing time must include a minute');
	});

	test('errors when either field is non-numeric', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);

		// Non-numeric hour
		let errors = await run(mw, {
			[`${fieldNamePrefix}-hour`]: 'aa',
			[`${fieldNamePrefix}-minute`]: '10'
		});
		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe(`Enter a ${label} using numbers 0 to 9`);

		// Non-numeric minute
		errors = await run(mw, {
			[`${fieldNamePrefix}-hour`]: '10',
			[`${fieldNamePrefix}-minute`]: 'bb'
		});
		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe(`Enter a ${label} using numbers 0 to 9`);
	});

	test('errors with "Enter a real ..." when BOTH hour and minute are out of range', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);
		const errors = await run(mw, {
			[`${fieldNamePrefix}-hour`]: '25', // > 23
			[`${fieldNamePrefix}-minute`]: '99' // > 59
		});

		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe(`Enter a real ${label}`);
	});

	test('errors when hour > 23 (minute in range)', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);
		const errors = await run(mw, {
			[`${fieldNamePrefix}-hour`]: '24',
			[`${fieldNamePrefix}-minute`]: '30'
		});

		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe('Hearing time hour must be 23 or less');
	});

	test('errors when minute > 59 (hour in range)', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);
		const errors = await run(mw, {
			[`${fieldNamePrefix}-hour`]: '23',
			[`${fieldNamePrefix}-minute`]: '60'
		});

		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe('Hearing time minute must be 59 or less');
	});

	test('trims hour and minute and passes when valid', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);
		const errors = await run(mw, {
			[`${fieldNamePrefix}-hour`]: ' 9 ',
			[`${fieldNamePrefix}-minute`]: ' 05 '
		});

		expect(errors).toHaveLength(0);
	});

	test('passes when continueValidationCondition returns false (skips validation)', async () => {
		const skip = () => false;
		const mw = createTimeInputValidator(fieldNamePrefix, label, skip);

		// Even with missing fields, should SKIP because .if(...) is false
		const errors = await run(mw, {});

		expect(errors).toHaveLength(0);
	});

	test('supports a different prefix and label', async () => {
		const otherPrefix = 'event-time';
		const otherLabel = 'event time';
		const mw = createTimeInputValidator(otherPrefix, otherLabel);

		const errors = await run(mw, {
			[`${otherPrefix}-hour`]: '',
			[`${otherPrefix}-minute`]: ''
		});

		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe(`Enter the ${otherLabel}`);
		expect(errors[0].path).toBe(`${otherPrefix}-hour`);
	});

	test('handles negative values (both out of range -> "Enter a real ...")', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);
		const errors = await run(mw, {
			[`${fieldNamePrefix}-hour`]: '-1',
			[`${fieldNamePrefix}-minute`]: '-5'
		});

		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe(`Enter a ${label} using numbers 0 to 9`);
	});

	test('hour negative (only hour out of range) should hit hour-specific message', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);
		const errors = await run(mw, {
			[`${fieldNamePrefix}-hour`]: '-1',
			[`${fieldNamePrefix}-minute`]: '30'
		});
		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe(`Enter a ${label} using numbers 0 to 9`);
	});

	test('minute negative (only minute out of range) should get numeric message', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);
		const errors = await run(mw, {
			[`${fieldNamePrefix}-hour`]: '10',
			[`${fieldNamePrefix}-minute`]: '-1'
		});

		expect(errors).toHaveLength(1);
		expect(errors[0].msg).toBe(`Enter a ${label} using numbers 0 to 9`);
	});

	test('valid upper bounds pass (23:59)', async () => {
		const mw = createTimeInputValidator(fieldNamePrefix, label);
		const errors = await run(mw, {
			[`${fieldNamePrefix}-hour`]: '23',
			[`${fieldNamePrefix}-minute`]: '59'
		});

		expect(errors).toHaveLength(0);
	});
});
