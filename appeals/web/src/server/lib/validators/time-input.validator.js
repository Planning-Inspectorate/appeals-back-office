import { timeIsBeforeTime } from '#lib/times.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { capitalize } from 'lodash-es';

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
	return createValidator(
		body(`${fieldNamePrefix}-hour`)
			.if(continueValidationCondition)
			.custom((hour, { req }) => {
				const minute = req.body[`${fieldNamePrefix}-minute`]?.trim();
				hour = hour?.trim();

				if (!hour || !minute) {
					throw new Error(`Enter the ${messageFieldNamePrefix}`);
				}
				if (!/^\d+$/.test(hour) || !/^\d+$/.test(minute)) {
					const error = new Error(`Enter a ${messageFieldNamePrefix} using numbers 0 to 9`);
					throw error;
				}
				const [hourNum, minuteNum] = [parseInt(hour, 10), parseInt(minute, 10)];
				if (minuteNum < 0 || minuteNum > 59 || hourNum < 0 || hourNum > 23) {
					const error = new Error(`Enter a real ${messageFieldNamePrefix}`);
					throw error;
				}
				return true;
			})
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
					!Number.isNaN(startTimeHour) &&
					!Number.isNaN(startTimeMinute) &&
					!Number.isNaN(endTimeHour) &&
					!Number.isNaN(endTimeMinute) &&
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
