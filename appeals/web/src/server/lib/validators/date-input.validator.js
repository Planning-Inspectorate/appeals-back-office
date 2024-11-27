import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import {
	dateIsValid,
	dateIsInTheFuture,
	dateIsTodayOrInThePast,
	dateIsInThePast,
	dayMonthYearHourMinuteToISOString
} from '../dates.js';
import { capitalize } from 'lodash-es';

export const createDateInputFieldsValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year',
	bodyScope = ''
) => {
	const _day = bodyScope ? `[${dayFieldName}]` : dayFieldName;
	const _month = bodyScope ? `[${monthFieldName}]` : monthFieldName;
	const _year = bodyScope ? `[${yearFieldName}]` : yearFieldName;

	return createValidator(
		body(bodyScope).custom((value) => {
			const day = value[`${fieldNamePrefix}${dayFieldName}`];
			const month = value[`${fieldNamePrefix}${monthFieldName}`];
			const year = value[`${fieldNamePrefix}${yearFieldName}`];

			if (day && month && year) {
				return true;
			}

			let missingParts = [];
			if (!day) missingParts.push('a day');
			if (!month) missingParts.push('a month');
			if (!year) missingParts.push('a year');

			const messageSuffix = missingParts.reduce((acc, part, index) => {
				if (index === missingParts.length - 1) {
					return `${acc}${part}`;
				}
				if (index === missingParts.length - 2) {
					return `${acc}${part} and `;
				}
				return `${acc}${part}, `;
			}, '');

			throw new Error(`${capitalize(messageFieldNamePrefix)} must include ${messageSuffix}`);
		}),
		body(`${bodyScope}${fieldNamePrefix}${_day}`)
			.if(Boolean)
			.isInt()
			.withMessage(capitalize(`${messageFieldNamePrefix} day must be a number`))
			.bail()
			.isLength({ min: 1, max: 2 })
			.withMessage(capitalize(`${messageFieldNamePrefix} day must be 1 or 2 digits`))
			.bail()
			.matches(/^0?[1-9]$|^1\d$|^2\d$|^3[01]$/)
			.withMessage(capitalize(`${messageFieldNamePrefix} day must be between 1 and 31`)),
		body(`${bodyScope}${fieldNamePrefix}${_month}`)
			.if(Boolean)
			.isInt()
			.withMessage(capitalize(`${messageFieldNamePrefix} month must be a number`))
			.bail()
			.isLength({ min: 1, max: 2 })
			.withMessage(capitalize(`${messageFieldNamePrefix} month must be 1 or 2 digits`))
			.bail()
			.matches(/^0?[1-9]$|^1[0-2]$/)
			.withMessage(capitalize(`${messageFieldNamePrefix} month must be between 1 and 12`)),
		body(`${bodyScope}${fieldNamePrefix}${_year}`)
			.if(Boolean)
			.isInt()
			.withMessage(capitalize(`${messageFieldNamePrefix} year must be a number`))
			.bail()
			.isLength({ min: 4, max: 4 })
			.withMessage(capitalize(`${messageFieldNamePrefix} year must be 4 digits`))
	);
};

export const createDateInputDateValidityValidator = (
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

				return dateIsValid({ day: dayNumber, month: monthNumber, year: yearNumber });
			})
			.withMessage(
				capitalize(
					`${(messageFieldNamePrefix && messageFieldNamePrefix + ' ') || ''}must be a valid date`
				)
			)
	);

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

export const createDateInputDateBusinessDayValidator = async (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year'
) =>
	await createValidator(
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
			.withMessage(
				capitalize(
					`${(messageFieldNamePrefix && messageFieldNamePrefix + ' ') || ''}must be a business day`
				)
			)
	);

export const createDateInputDateInFutureValidator = (
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

				if (!day || !month || !year) {
					return false;
				}

				const dayNumber = Number.parseInt(day, 10);
				const monthNumber = Number.parseInt(month, 10);
				const yearNumber = Number.parseInt(year, 10);

				return dateIsInTheFuture({ day: dayNumber, month: monthNumber, year: yearNumber });
			})
			.withMessage(
				capitalize(
					`${(messageFieldNamePrefix && messageFieldNamePrefix + ' ') || ''}must be in the future`
				)
			)
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
