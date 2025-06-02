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
		body(bodyScope).custom((value) => {
			const day = value[`${fieldNamePrefix}${dayFieldName}`];
			const month = value[`${fieldNamePrefix}${monthFieldName}`];
			const year = value[`${fieldNamePrefix}${yearFieldName}`];

			if (day && month && year) {
				return true;
			}

			if (!day && !month && !year) {
				throw new Error(`Enter the ${lowerCase(messageFieldNamePrefix)}`);
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

			throw new Error(`${messageFieldNamePrefix} must include ${messageSuffix}`);
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
	const daySuffix = '-day';
	const monthSuffix = '-month';
	const yearSuffix = '-year';

	const dayFieldKey = `${fieldNamePrefix}${daySuffix}`;
	const monthFieldKey = `${fieldNamePrefix}${monthSuffix}`;
	const yearFieldKey = `${fieldNamePrefix}${yearSuffix}`;

	return (req, res, next) => {
		// If there are no errors or if errors is not an object, just continue to the next middleware
		if (!req.errors || typeof req.errors !== 'object' || req.errors === null) {
			return next();
		}

		const allOriginalErrors = req.errors;
		/**
		 * @type {string[]}
		 * @description Stores the keys of errors related to this component, in their original encounter order.
		 */
		const componentKeys = [];
		/**
		 * @type {{ [key: string]: any }}
		 * @description Stores errors not related to this component.
		 */
		const otherErrors = {};
		/**
		 * @type {any | null}
		 * @description Stores the error object if key is '' AND it's identified as belonging to this component.
		 */
		let generalErrorObjectIfRelevant = null;

		// 1. Iterate through original errors to identify component errors (in order) and other errors.
		const originalKeys = Object.keys(allOriginalErrors);

		for (const key of originalKeys) {
			const errorObject = allOriginalErrors[key];
			let isErrorForThisComponent = false;

			if (key === dayFieldKey || key === monthFieldKey || key === yearFieldKey) {
				isErrorForThisComponent = true;
			} else if (key === '') {
				if (errorObject.value && typeof errorObject.value === 'object') {
					const nestedKeys = Object.keys(errorObject.value);
					// Check if the '' error's value object contains fields related to the date component.
					if (nestedKeys.some((nk) => nk.startsWith(fieldNamePrefix + '-'))) {
						isErrorForThisComponent = true;
						generalErrorObjectIfRelevant = errorObject;
					}
				}
			} else if (key.startsWith(fieldNamePrefix + '-')) {
				// Catches other custom prefixed keys
				isErrorForThisComponent = true;
			}

			if (isErrorForThisComponent) {
				componentKeys.push(key);
			} else {
				otherErrors[key] = errorObject;
			}
		}

		// If no errors were found for this specific date component,
		// leave the errors as is and move to nbext middleware.
		if (componentKeys.length === 0) {
			req.errors = otherErrors;
			return next();
		}

		const chosenErrorKey = componentKeys[0];

		// Get the corresponding error object.
		// If chosenErrorKey is '', and it was identified as relevant, use the stored generalErrorObjectIfRelevant.
		// Otherwise, get it directly from allOriginalErrors using chosenErrorKey.
		const chosenErrorObject =
			chosenErrorKey === '' && generalErrorObjectIfRelevant
				? generalErrorObjectIfRelevant
				: allOriginalErrors[chosenErrorKey];

		// 3. If the chosen primary error was keyed as '', attempt to re-key it.
		let finalKeyForComponent = chosenErrorKey;
		if (chosenErrorKey === '' && chosenErrorObject) {
			const nestedValueObject = chosenErrorObject.value;
			let reKeyedToSpecificField = false;

			// If the error object has a value that is an object, re-key it to a specific field.
			if (nestedValueObject && typeof nestedValueObject === 'object') {
				const relevantNestedKeys = Object.keys(nestedValueObject)
					.filter((k) => k.startsWith(fieldNamePrefix + '-'))
					.sort((a, b) => {
						if (a.endsWith(daySuffix)) return -1;
						if (b.endsWith(daySuffix)) return 1;
						if (a.endsWith(monthSuffix)) return -1;
						if (b.endsWith(monthSuffix)) return 1;
						return a.localeCompare(b);
					});

				if (relevantNestedKeys.length > 0) {
					let preferredNewKey = null;
					// Try to find the first relevant nested key whose value is an empty string.
					for (const currentNestedKey of relevantNestedKeys) {
						if (nestedValueObject[currentNestedKey] === '') {
							preferredNewKey = currentNestedKey;
							break;
						}
					}
					// If no empty value field found, use the first relevant (and sorted) nested key.
					if (preferredNewKey === null) {
						preferredNewKey = relevantNestedKeys[0];
					}
					finalKeyForComponent = preferredNewKey;
					reKeyedToSpecificField = true;
				}
			}

			// If nothing retrived from previous step - defualt to the day field key.
			if (!reKeyedToSpecificField) {
				finalKeyForComponent = dayFieldKey;
			}
		}
		req.errors = { ...otherErrors };
		req.errors[finalKeyForComponent] = chosenErrorObject;

		next();
	};
};
