import { parseISO } from 'date-fns';
import {
	ERROR_MUST_BE_BUSINESS_DAY,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_IN_FUTURE,
	ERROR_MUST_NOT_BE_IN_FUTURE
} from '@pins/appeals/constants/support.js';
import { body } from 'express-validator';
import { dateIsAfterDate, dateIsPastOrToday } from '#utils/date-comparison.js';
import { recalculateDateIfNotBusinessDay } from '@pins/appeals/utils/business-days.js';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {{
 * 	parameterName: string,
 *  mustBeFutureDate?: boolean,
 *  mustBeNotBeFutureDate?: boolean,
 *  mustBeBusinessDay?: boolean,
 *  isRequired?: boolean,
 *  customFn?: (value: any, other: {req: any}) => Error | boolean
 * }} param0
 * @returns {ValidationChain}
 */
const validateDateParameter = ({
	parameterName,
	mustBeFutureDate = false,
	mustBeBusinessDay = false,
	mustBeNotBeFutureDate = false,
	isRequired = false,
	customFn = () => true
}) => {
	const validator = body(parameterName);

	!isRequired && validator.optional();
	const isoUtcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

	return validator
		.custom((value) => {
			const parsedDate = parseISO(value);
			if (isNaN(parsedDate.getTime())) {
				throw new Error(ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT);
			}

			return parsedDate;
		})
		.matches(isoUtcRegex)
		.withMessage(ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT)
		.bail()
		.custom((value) => (mustBeFutureDate ? dateIsAfterDate(parseISO(value), new Date()) : true))
		.withMessage(ERROR_MUST_BE_IN_FUTURE)
		.bail()
		.custom((value) =>
			mustBeNotBeFutureDate ? dateIsPastOrToday(parseISO(value), new Date()) : true
		)
		.withMessage(ERROR_MUST_NOT_BE_IN_FUTURE)
		.bail()
		.custom(async (value) => {
			if (mustBeBusinessDay) {
				const recalculatedDate = await recalculateDateIfNotBusinessDay(value);
				const originalDate = parseISO(value);
				if (!isSameDay(originalDate, recalculatedDate)) {
					throw new Error(ERROR_MUST_BE_BUSINESS_DAY);
				}
			}

			return true;
		})
		.custom(customFn);
};

/**
 *
 * @param {Date} dateleft
 * @param {Date} dateright
 * @returns {boolean}
 */
const isSameDay = (dateleft, dateright) =>
	dateleft.getDay() === dateright.getDay() &&
	dateleft.getMonth() === dateright.getMonth() &&
	dateleft.getFullYear() === dateright.getFullYear();

export default validateDateParameter;
