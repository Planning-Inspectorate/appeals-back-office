import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import {
	dateIsValid,
	dateIsInTheFuture,
	dateIsTodayOrInThePast,
	dateIsInThePast,
	dayMonthYearHourMinuteToISOString
} from '../dates.js';
import { capitalize, lowerCase } from 'lodash-es';

export const createDateInputNoEmptyFieldsValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'Date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year',
	bodyScope = ''
) => {
	const _day = bodyScope ? `[${dayFieldName}]` : dayFieldName;
	const _month = bodyScope ? `[${monthFieldName}]` : monthFieldName;
	const _year = bodyScope ? `[${yearFieldName}]` : yearFieldName;

	return createValidator(
		body().custom((bodyFields) => {
			const day = bodyFields[`${bodyScope}${fieldNamePrefix}${_day}`];
			const month = bodyFields[`${bodyScope}${fieldNamePrefix}${_month}`];
			const year = bodyFields[`${bodyScope}${fieldNamePrefix}${_year}`];

			if (!day && !month && !year) {
				throw new Error(`Enter the ${messageFieldNamePrefix}`);
			}
			return true;
		})
	);
};

export const createDateInputFieldsValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'Date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year',
	bodyScope = ''
) => {
	const _day = bodyScope ? `[${dayFieldName}]` : dayFieldName;
	const _month = bodyScope ? `[${monthFieldName}]` : monthFieldName;
	const _year = bodyScope ? `[${yearFieldName}]` : yearFieldName;

	return createValidator(
		body(`${bodyScope}${fieldNamePrefix}${_day}`)
			.custom((value) => {
				if (!value) {
					throw new Error(`${messageFieldNamePrefix} must include a day`);
				}
				return true;
			})
			.bail()
			.if(Boolean)
			.isInt()
			.withMessage(`${messageFieldNamePrefix} day must be a number`)
			.bail()
			.isLength({ min: 1, max: 2 })
			.withMessage(`${messageFieldNamePrefix} day must be 1 or 2 digits`)
			.bail()
			.matches(/^0?[1-9]$|^1\d$|^2\d$|^3[01]$/)
			.withMessage(`${messageFieldNamePrefix} day must be between 1 and 31`),
		body(`${bodyScope}${fieldNamePrefix}${_month}`)
			.custom((value) => {
				if (!value) {
					throw new Error(`${messageFieldNamePrefix} must include a month`);
				}
				return true;
			})
			.bail()
			.if(Boolean)
			.isInt()
			.withMessage(`${messageFieldNamePrefix} month must be a number`)
			.bail()
			.isLength({ min: 1, max: 2 })
			.withMessage(`${messageFieldNamePrefix} month must be 1 or 2 digits`)
			.bail()
			.matches(/^0?[1-9]$|^1[0-2]$/)
			.withMessage(`${messageFieldNamePrefix} month must be between 1 and 12`),
		body(`${bodyScope}${fieldNamePrefix}${_year}`)
			.custom((value) => {
				if (!value) {
					throw new Error(`${messageFieldNamePrefix} must include a year`);
				}
				return true;
			})
			.bail()
			.if(Boolean)
			.isInt()
			.withMessage(`${messageFieldNamePrefix} year must be a number`)
			.bail()
			.isLength({ min: 4, max: 4 })
			.withMessage(`${messageFieldNamePrefix} year must be 4 digits`)
	);
};

export const createDateInputDateValidityValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'Date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year'
) =>
	createValidator(
		body()
			.custom((bodyFields) => {
				const day = bodyFields[`${fieldNamePrefix}${dayFieldName}`];
				const month = bodyFields[`${fieldNamePrefix}${monthFieldName}`];
				const year = bodyFields[`${fieldNamePrefix}${yearFieldName}`];

				if (!(day && month && year)) {
					return true;
				}

				const dayNumber = Number.parseInt(day, 10);
				const monthNumber = Number.parseInt(month, 10);
				const yearNumber = Number.parseInt(year, 10);

				return dateIsValid({ day: dayNumber, month: monthNumber, year: yearNumber });
			})
			.withMessage(
				`${(messageFieldNamePrefix && messageFieldNamePrefix + ' ') || ''}must be a real date`
			)
	);

export const createDateInputEmptyFieldsValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'Date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year',
	bodyScope = ''
) => {
	const _day = bodyScope ? `[${dayFieldName}]` : dayFieldName;
	const _month = bodyScope ? `[${monthFieldName}]` : monthFieldName;
	const _year = bodyScope ? `[${yearFieldName}]` : yearFieldName;

	return createValidator(
		body().custom((bodyFields) => {
			const day = bodyFields[`${bodyScope}${fieldNamePrefix}${_day}`];
			const month = bodyFields[`${bodyScope}${fieldNamePrefix}${_month}`];
			const year = bodyFields[`${bodyScope}${fieldNamePrefix}${_year}`];
			if (!day && !month && !year) {
				throw new Error(`Enter the ${messageFieldNamePrefix.toLowerCase()}`);
			}
			return true;
		})
	);
};
/**
 * @param {import('got').Got} apiClient
 * @param {string} value
 * @returns {Promise<boolean>}
 */
const dateIsABusinessDay = async (apiClient, value) => {
	try {
		const result = await apiClient
			.post(`appeals/validate-business-date`, {
				json: { inputDate: value }
			})
			.json();
		return result;
	} catch {
		return false;
	}
};

export const createDateInputDateBusinessDayValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'Date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year'
) =>
	createValidator(
		body()
			.custom(async (bodyFields, { req }) => {
				const day = bodyFields[`${fieldNamePrefix}${dayFieldName}`];
				const month = bodyFields[`${fieldNamePrefix}${monthFieldName}`];
				const year = bodyFields[`${fieldNamePrefix}${yearFieldName}`];

				if (!day || !month || !year) {
					return false;
				}

				const dateToValidate = dayMonthYearHourMinuteToISOString({
					day,
					month,
					year
				});

				const result = await dateIsABusinessDay(req.apiClient, dateToValidate);
				if (result === false) {
					return Promise.reject();
				}
				return result;
			})
			.withMessage(`The ${lowerCase(messageFieldNamePrefix || '')} must be a business day`)
	);

export const createDateInputDateInFutureValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'Date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year'
) =>
	createValidator(
		body()
			.custom((bodyFields) => {
				const day = bodyFields[`${fieldNamePrefix}${dayFieldName}`];
				const month = bodyFields[`${fieldNamePrefix}${monthFieldName}`];
				const year = bodyFields[`${fieldNamePrefix}${yearFieldName}`];

				if (!day || !month || !year) {
					return true;
				}

				const dayNumber = Number.parseInt(day, 10);
				const monthNumber = Number.parseInt(month, 10);
				const yearNumber = Number.parseInt(year, 10);

				return dateIsInTheFuture({ day: dayNumber, month: monthNumber, year: yearNumber });
			})
			.withMessage(`The ${lowerCase(messageFieldNamePrefix || '')} must be in the future`)
	);

export const createDateInputDateInPastOrTodayValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year'
) =>
	createValidator(
		body()
			.custom((bodyFields) => {
				const day = bodyFields[`${fieldNamePrefix}${dayFieldName}`];
				const month = bodyFields[`${fieldNamePrefix}${monthFieldName}`];
				const year = bodyFields[`${fieldNamePrefix}${yearFieldName}`];

				if (!(day && month && year)) {
					return true;
				}

				const dayNumber = Number.parseInt(day, 10);
				const monthNumber = Number.parseInt(month, 10);
				const yearNumber = Number.parseInt(year, 10);

				return dateIsTodayOrInThePast({ day: dayNumber, month: monthNumber, year: yearNumber });
			})
			.withMessage(
				capitalize(
					`${
						(messageFieldNamePrefix && messageFieldNamePrefix + ' ') || ''
					}must be today or in the past`
				)
			)
	);

export const createDateInputDateInPastValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year'
) =>
	createValidator(
		body()
			.custom((bodyFields) => {
				const day = bodyFields[`${fieldNamePrefix}${dayFieldName}`];
				const month = bodyFields[`${fieldNamePrefix}${monthFieldName}`];
				const year = bodyFields[`${fieldNamePrefix}${yearFieldName}`];

				if (!(day && month && year)) {
					return true;
				}

				const dayNumber = Number.parseInt(day, 10);
				const monthNumber = Number.parseInt(month, 10);
				const yearNumber = Number.parseInt(year, 10);

				return dateIsInThePast({ day: dayNumber, month: monthNumber, year: yearNumber });
			})
			.withMessage(
				capitalize(
					`${(messageFieldNamePrefix && messageFieldNamePrefix + ' ') || ''}must in the past`
				)
			)
	);
