import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { capitalize } from 'lodash-es';
import { timeIsBeforeTime } from '#lib/times.js';

/**
 * @typedef {import('express-validator').ValidationChain} ValidationChain
 * @typedef {import('express-validator').CustomValidator} CustomValidator
 */

/**
 * Creates a validator for a time input component.
 * @param {string} [fieldNamePrefix]
 * @param {string | null} [messageFieldNamePrefix]
 * @param {ValidationChain | CustomValidator} [continueValidationCondition]
 * @returns {import('express').RequestHandler<any>}
 */
export const createTimeInputValidator = (
	fieldNamePrefix = 'time',
	messageFieldNamePrefix = null,
	// @ts-ignore
	// eslint-disable-next-line no-unused-vars
	continueValidationCondition = (value) => true
) => {
	const missingPrefix = messageFieldNamePrefix ? capitalize(messageFieldNamePrefix) : 'The time';
	const invalidPrefix = messageFieldNamePrefix ? capitalize(messageFieldNamePrefix) : 'The';

	return createValidator(
		body(`${fieldNamePrefix}-hour`)
			.if(continueValidationCondition)
			.trim()
			.notEmpty()
			.withMessage(capitalize(`${missingPrefix} must include an hour`))
			.bail()
			.isInt()
			.withMessage(capitalize(`${invalidPrefix} hour must be a number`))
			.bail()
			.isInt({ min: 0, max: 23 })
			.withMessage(capitalize(`${invalidPrefix} hour cannot be less than 0 or greater than 23`)),
		body(`${fieldNamePrefix}-minute`)
			.if(continueValidationCondition)
			.trim()
			.notEmpty()
			.withMessage(capitalize(`${missingPrefix} must include a minute`))
			.bail()
			.isInt()
			.withMessage(capitalize(`${invalidPrefix} minute must be a number`))
			.bail()
			.isInt({ min: 0, max: 59 })
			.withMessage(capitalize(`${invalidPrefix} minute cannot be less than 0 or greater than 59`))
	);
};

export const createStartTimeBeforeEndTimeValidator = (
	startTimeFieldNamePrefix = 'startTime',
	endTimeFieldNamePrefix = 'endTime',
	startTimeMessageFieldNamePrefix = 'start time',
	endTimeMessageFieldNamePrefix = 'end time',
	// @ts-ignore
	// eslint-disable-next-line no-unused-vars
	continueValidationCondition = (value) => true
) => {
	return createValidator(
		body(`${startTimeFieldNamePrefix}-hour`)
			.if(continueValidationCondition)
			.custom((_, { req }) => {
				const startTimeHour = parseInt(req.body[`${startTimeFieldNamePrefix}-hour`], 10);
				const startTimeMinute = parseInt(req.body[`${startTimeFieldNamePrefix}-minute`], 10);
				const endTimeHour = parseInt(req.body[`${endTimeFieldNamePrefix}-hour`], 10);
				const endTimeMinute = parseInt(req.body[`${endTimeFieldNamePrefix}-minute`], 10);

				if (
					Number.isNaN(startTimeHour) ||
					Number.isNaN(startTimeMinute) ||
					Number.isNaN(endTimeHour) ||
					Number.isNaN(endTimeMinute) ||
					!timeIsBeforeTime(startTimeHour, startTimeMinute, endTimeHour, endTimeMinute)
				) {
					throw new Error(
						`${capitalize(
							startTimeMessageFieldNamePrefix
						)} must be before ${endTimeMessageFieldNamePrefix}`
					);
				}
				return true;
			})
	);
};
