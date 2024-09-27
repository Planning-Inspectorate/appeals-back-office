import { isEqual } from 'date-fns';
import {
	ERROR_MUST_BE_BUSINESS_DAY,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_IN_FUTURE,
	ERROR_MUST_NOT_BE_IN_FUTURE
} from '#endpoints/constants.js';
import { body } from 'express-validator';
import { dateIsAfterDate, dateIsPastOrToday } from '#utils/date-comparison.js';
import { recalculateDateIfNotBusinessDay } from '#utils/business-days.js';

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

	return validator
		.isISO8601().toDate()
		.withMessage(ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT)
		.custom((value) => (mustBeFutureDate ? dateIsAfterDate(value, new Date()) : true))
		.withMessage(ERROR_MUST_BE_IN_FUTURE)
		.custom((value) =>
			mustBeNotBeFutureDate ? dateIsPastOrToday(value, new Date()) : true
		)
		.withMessage(ERROR_MUST_NOT_BE_IN_FUTURE)
		.custom(async (value) => {
			if (mustBeBusinessDay) {
				const recalculatedDate = await recalculateDateIfNotBusinessDay(value.toISOString());

				if (!isEqual(value, recalculatedDate)) {
					throw new Error(ERROR_MUST_BE_BUSINESS_DAY);
				}
			}

			return true;
		})
		.custom(customFn)
		.customSanitizer((value) => value);
};

export default validateDateParameter;
