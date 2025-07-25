import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import {
	dateIsValid,
	dateIsInTheFuture,
	dateIsTodayOrInThePast,
	dateIsInThePast,
	dayMonthYearHourMinuteToISOString,
	dateIsAfter
} from '../dates.js';
import { capitalize, lowerCase } from 'lodash-es';
import { toCamelCase } from '#lib/string-utilities.js';

export const createDateInputFieldsValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'Date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year',
	bodyScope = ''
) => {
	return createValidator(
		body([`${bodyScope}${fieldNamePrefix}`]).custom((_, { req }) => {
			const day = req.body[`${fieldNamePrefix}${dayFieldName}`];
			const month = req.body[`${fieldNamePrefix}${monthFieldName}`];
			const year = req.body[`${fieldNamePrefix}${yearFieldName}`];

			if (!day && !month && !year) {
				throw new Error(`all-fields::Enter the ${lowerCase(messageFieldNamePrefix)}`, {
					cause: 'all-fields'
				});
			}

			let missingParts = [];
			let cause = [];
			if (!day) {
				missingParts.push('a day');
				cause.push('day');
			}
			if (!month) {
				missingParts.push('a month');
				cause.push('month');
			}
			if (!year) {
				missingParts.push('a year');
				cause.push('year');
			}

			if (missingParts.length > 0) {
				const joinedCause = cause.join('-');
				const messageSuffix = missingParts.reduce((acc, part, index) => {
					if (index === missingParts.length - 1) return `${acc}${part}`;
					if (index === missingParts.length - 2) return `${acc}${part} and `;
					return `${acc}${part}, `;
				}, '');
				throw new Error(`${joinedCause}::${messageFieldNamePrefix} must include ${messageSuffix}`);
			}

			if (!/^\d+$/.test(day)) {
				throw new Error(`day::${messageFieldNamePrefix} day must be a number`);
			}

			if (!/^\d{1,2}$/.test(day)) {
				throw new Error(`day::${messageFieldNamePrefix} day must be 1 or 2 digits`);
			}
			if (!/^0?[1-9]$|^1\d$|^2\d$|^3[01]$/.test(day)) {
				throw new Error(`day::${messageFieldNamePrefix} day must be between 1 and 31`);
			}
			if (!/^\d+$/.test(month)) {
				throw new Error(`month::${messageFieldNamePrefix} month must be a number`);
			}
			if (!/^\d{1,2}$/.test(month)) {
				throw new Error(`month::${messageFieldNamePrefix} month must be 1 or 2 digits`);
			}
			if (!/^0?[1-9]$|^1[0-2]$/.test(month)) {
				throw new Error(`month::${messageFieldNamePrefix} month must be between 1 and 12`);
			}
			if (!/^\d+$/.test(year)) {
				throw new Error(`year::${messageFieldNamePrefix} year must be a number`);
			}
			if (!/^\d{4}$/.test(year)) {
				throw new Error(`year::${messageFieldNamePrefix} year must be 4 digits`);
			}

			return true;
		})
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
		body([`${fieldNamePrefix}`])
			.custom((_, { req }) => {
				const day = req.body[`${fieldNamePrefix}${dayFieldName}`];
				const month = req.body[`${fieldNamePrefix}${monthFieldName}`];
				const year = req.body[`${fieldNamePrefix}${yearFieldName}`];

				if (!(day && month && year)) {
					return true;
				}

				const dayNumber = Number.parseInt(day, 10);
				const monthNumber = Number.parseInt(month, 10);
				const yearNumber = Number.parseInt(year, 10);

				return dateIsValid({ day: dayNumber, month: monthNumber, year: yearNumber });
			})
			.withMessage(
				`all-fields::${
					(messageFieldNamePrefix && messageFieldNamePrefix + ' ') || ''
				}must be a real date`
			)
	);
/**
 * @param {import('got').Got} apiClient
 * @param {string} value
 * @returns {Promise<boolean>}
 */
export const dateIsABusinessDay = async (apiClient, value) => {
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
		body(`${fieldNamePrefix}`)
			.custom(async (bodyFields, { req }) => {
				const day = req.body[`${fieldNamePrefix}${dayFieldName}`];
				const month = req.body[`${fieldNamePrefix}${monthFieldName}`];
				const year = req.body[`${fieldNamePrefix}${yearFieldName}`];

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
				`all-fields::The ${lowerCase(messageFieldNamePrefix || '')} must be a business day`
			)
	);

export const createDateInputDateInFutureValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'Date',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year'
) =>
	createValidator(
		body(`${fieldNamePrefix}`)
			.custom((bodyFields, { req }) => {
				const day = req.body[`${fieldNamePrefix}${dayFieldName}`];
				const month = req.body[`${fieldNamePrefix}${monthFieldName}`];
				const year = req.body[`${fieldNamePrefix}${yearFieldName}`];

				if (!day || !month || !year) {
					return true;
				}

				const dayNumber = Number.parseInt(day, 10);
				const monthNumber = Number.parseInt(month, 10);
				const yearNumber = Number.parseInt(year, 10);

				return dateIsInTheFuture({ day: dayNumber, month: monthNumber, year: yearNumber });
			})
			.withMessage(
				`all-fields::The ${lowerCase(messageFieldNamePrefix || '')} must be in the future`
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
		body(`${fieldNamePrefix}`)
			.custom((bodyFields, { req }) => {
				const day = req.body[`${fieldNamePrefix}${dayFieldName}`];
				const month = req.body[`${fieldNamePrefix}${monthFieldName}`];
				const year = req.body[`${fieldNamePrefix}${yearFieldName}`];

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
		body(`${fieldNamePrefix}`)
			.custom((bodyFields, { req }) => {
				const day = req.body[`${fieldNamePrefix}${dayFieldName}`];
				const month = req.body[`${fieldNamePrefix}${monthFieldName}`];
				const year = req.body[`${fieldNamePrefix}${yearFieldName}`];

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
					`all-fields::${
						(messageFieldNamePrefix && messageFieldNamePrefix + ' ') || ''
					}must in the past`
				)
			)
	);

export const createDateInputDateInFutureOfDateValidator = (
	fieldNamePrefix = 'date',
	messageFieldNamePrefix = 'Date',
	fieldNameToComparePrefix = '',
	messageFieldNameToComparePrefix = '',
	dayFieldName = '-day',
	monthFieldName = '-month',
	yearFieldName = '-year'
) =>
	createValidator(
		body(`${fieldNamePrefix}`).custom((bodyFields, { req }) => {
			if (!fieldNameToComparePrefix) return true;

			const getDateParts = (/** @type {string} */ prefix) => ({
				day: req.body[`${prefix}${dayFieldName}`],
				month: req.body[`${prefix}${monthFieldName}`],
				year: req.body[`${prefix}${yearFieldName}`]
			});

			const currentParts = getDateParts(fieldNamePrefix);
			const compareParts = getDateParts(fieldNameToComparePrefix);

			// If any part of the current date is missing, skip validation
			if (!currentParts.day || !currentParts.month || !currentParts.year) {
				return true;
			}

			const storedDateToCompare = new Date(
				req.currentAppeal.appealTimetable[toCamelCase(fieldNameToComparePrefix)]
			);

			if (!storedDateToCompare || isNaN(storedDateToCompare.getTime())) {
				return true;
			}

			const parseOrFallback = (
				/** @type {string | undefined} */ value,
				/** @type {number} */ fallback
			) => (value !== undefined && value !== '' ? Number.parseInt(value, 10) : fallback);

			const compareDay = parseOrFallback(compareParts.day, storedDateToCompare.getDate());
			const compareMonth = parseOrFallback(compareParts.month, storedDateToCompare.getMonth() + 1); // getMonth() is 0-based
			const compareYear = parseOrFallback(compareParts.year, storedDateToCompare.getFullYear());

			const currentDay = Number.parseInt(currentParts.day, 10);
			const currentMonth = Number.parseInt(currentParts.month, 10);
			const currentYear = Number.parseInt(currentParts.year, 10);

			if (
				!dateIsAfter(
					{ day: currentDay, month: currentMonth, year: currentYear },
					{ day: compareDay, month: compareMonth, year: compareYear }
				)
			) {
				const formattedDate = new Date(
					compareYear,
					compareMonth - 1,
					compareDay
				).toLocaleDateString('en-GB', {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				});
				throw new Error(
					`all-fields::${messageFieldNamePrefix} must be after the ${messageFieldNameToComparePrefix} on ${formattedDate}`
				);
			}
			return true;
		})
	);

/**
 * @param {{ fieldNamePrefix: string }} dateComponentConfig - Configuration for the date component.
 * @returns {import('express').RequestHandler} The configured Express middleware.
 */
export const extractAndProcessDateErrors = ({ fieldNamePrefix }) => {
	return (req, res, next) => {
		if (!req.errors) {
			return next();
		}
		for (const e of Object.keys(req.errors)) {
			if (req.errors[e].msg.includes('whole-page')) {
				const [cause, message] = req.errors[e].msg.split('::');
				req.errors[e].param = `${cause}`;
				req.errors[e].msg = message;
				req.errors = {
					e: req.errors[e]
				};
				return next();
			}
		}

		const dateFields = [
			`${fieldNamePrefix}`,
			`${fieldNamePrefix}-day`,
			`${fieldNamePrefix}-month`,
			`${fieldNamePrefix}-year`
		];

		/**
		 * @type {string | null}
		 */
		let firstErrorKey = null;

		for (const field of dateFields) {
			if (req.errors && req.errors[field]) {
				firstErrorKey = field;
				break;
			}
		}

		if (firstErrorKey && req.errors) {
			if (firstErrorKey === `${fieldNamePrefix}`) {
				const errorDetails = req.errors[`${firstErrorKey}`];
				if (errorDetails.msg.includes('::')) {
					const [cause, message] = errorDetails.msg.split('::');
					errorDetails.param = `${cause}`;
					errorDetails.msg = message;
					switch (cause) {
						case 'all-fields':
							req.errors[`${fieldNamePrefix}-day`] = errorDetails;
							firstErrorKey = dateFields[1];
							break;
						case 'day':
							req.errors[`${fieldNamePrefix}-day`] = errorDetails;
							firstErrorKey = dateFields[1];
							break;
						case 'day-month':
							req.errors[`${fieldNamePrefix}-day`] = errorDetails;
							firstErrorKey = dateFields[1];
							break;
						case 'day-year':
							req.errors[`${fieldNamePrefix}-day`] = errorDetails;
							firstErrorKey = dateFields[1];
							break;
						case 'month':
							req.errors[`${fieldNamePrefix}-month`] = errorDetails;
							firstErrorKey = dateFields[2];
							break;
						case 'month-year':
							req.errors[`${fieldNamePrefix}-month`] = errorDetails;
							firstErrorKey = dateFields[2];
							break;
						case 'year':
							req.errors[`${fieldNamePrefix}-year`] = errorDetails;
							firstErrorKey = dateFields[3];
							break;
					}
				} else {
					req.errors[`${fieldNamePrefix}-day`] = req.errors[`${fieldNamePrefix}`];
					req.errors[`${fieldNamePrefix}-day`].param = 'all-fields';
					firstErrorKey = dateFields[1];
				}

				delete req.errors[`${fieldNamePrefix}`];
			}

			dateFields
				.filter((field) => field !== firstErrorKey)
				.forEach((field) => {
					if (req.errors) {
						delete req.errors[field];
					}
				});
		}
		req.errors = { ...req.errors };
		return next();
	};
};
/**
 * @returns {import('express').RequestHandler} The configured Express middleware.
 */
export const extractAndProcessDocumentDateErrors = () => {
	return (req, res, next) => {
		if (!req.errors) {
			return next();
		}
		for (const key in req.errors) {
			if (Object.hasOwnProperty.call(req.errors, key)) {
				const errorDetails = req.errors[key];
				if (errorDetails.msg.includes('::')) {
					const [cause, message] = errorDetails.msg.split('::');
					errorDetails.param = `${cause}`;
					errorDetails.msg = message;
				}
			}
		}
		return next();
	};
};
