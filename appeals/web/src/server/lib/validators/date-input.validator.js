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
	let stopValidation = false;
	const _day = bodyScope ? `[${dayFieldName}]` : dayFieldName;
	const _month = bodyScope ? `[${monthFieldName}]` : monthFieldName;
	const _year = bodyScope ? `[${yearFieldName}]` : yearFieldName;

	return createValidator(
		body([`${bodyScope}${fieldNamePrefix}`]).custom((_, { req }) => {
			const day = req.body[`${fieldNamePrefix}${dayFieldName}`];
			const month = req.body[`${fieldNamePrefix}${monthFieldName}`];
			const year = req.body[`${fieldNamePrefix}${yearFieldName}`];

			if (day && month && year) {
				return true;
			}

			if (!day && !month && !year) {
				stopValidation = true;
				throw new Error(`Enter the ${lowerCase(messageFieldNamePrefix)}`, { cause: 'all-fields' });
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
			if (missingParts.length > 1) {
				stopValidation = true;
				throw new Error(`${messageFieldNamePrefix} must include ${messageSuffix}`);
			}
		}),
		body(`${bodyScope}${fieldNamePrefix}${_day}`).custom((value) => {
			if (!value && !stopValidation) {
				throw new Error(`${messageFieldNamePrefix} must include a day`);
			}
			return true;
		}),
		body(`${bodyScope}${fieldNamePrefix}${_month}`).custom((value) => {
			if (!value && !stopValidation) {
				throw new Error(`${messageFieldNamePrefix} must include a month`);
			}
			return true;
		}),
		body(`${bodyScope}${fieldNamePrefix}${_year}`).custom((value) => {
			if (!value && !stopValidation) {
				throw new Error(`${messageFieldNamePrefix} must include a year`);
			}
			return true;
		}),
		body(`${bodyScope}${fieldNamePrefix}${_day}`)
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
				`${(messageFieldNamePrefix && messageFieldNamePrefix + ' ') || ''}must be a real date`
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
					`${(messageFieldNamePrefix && messageFieldNamePrefix + ' ') || ''}must in the past`
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
				const formattedDate = storedDateToCompare.toLocaleDateString('en-GB', {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				});
				throw new Error(
					`${messageFieldNamePrefix} must be after the ${messageFieldNameToComparePrefix} on ${formattedDate}`
				);
			}
			return true;
		})
	);

/**
 * This middelware will handle errors related to a date component
 * and processes them to ensure taht only one error is returned at the correct time for the component
 * It will rekey any error to the most relevant field for the date component,
 * ensuring that the UI is compatable with acceccibility criteria
 *
 * The middleware will:
 * 1. Identify all errors related to the date component based on the fieldNamePrefix.
 * 2. Select the first error encountered for the component.
 * 3. If the first error is a general error (keyed as ''), it will attempt to re-key it to a specific field
 *   within the component (e.g., 'prefix-day', 'prefix-month', 'prefix-year').
 * 4. If re-keying is not possible, it will default to the primary field key for the component (e.g., 'prefix-day').
 * 5. All other errors not related to this component will be preserved in the `req.errors` object.
 *
 * @param {{ fieldNamePrefix: string }} dateComponentConfig - Configuration for the date component.
 * @returns {import('express').RequestHandler} The configured Express middleware.
 */
export const extractAndProcessDateErrors = ({ fieldNamePrefix }) => {
	return (req, res, next) => {
		if (!req.errors) {
			return next();
		}

		const dateFields = [
			`${fieldNamePrefix}-day`,
			`${fieldNamePrefix}-month`,
			`${fieldNamePrefix}-year`,
			`${fieldNamePrefix}`
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
				req.errors[`${fieldNamePrefix}-day`] = req.errors[`${fieldNamePrefix}`];
				req.errors[`${fieldNamePrefix}-day`].param = 'all-fields';
				firstErrorKey = dateFields[0];
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
