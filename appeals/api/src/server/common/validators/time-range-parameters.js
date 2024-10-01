import {
	ERROR_START_TIME_MUST_BE_EARLIER_THAN_END_TIME } from '#endpoints/constants.js';
import { compareDesc, parseISO } from 'date-fns';
import { body } from 'express-validator';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} startParameter
 * @param {string} endParameter
 * @returns {ValidationChain}
 */
const validateTimeRangeParameters = (startParameter, endParameter) =>
	body(startParameter)
		.optional()
		.custom((value, { req }) => {
			const startValue = req.body[startParameter];
			const endValue = req.body[endParameter];
			const parsedStart = new Date(typeof startValue === 'string' ? parseISO(startValue) : startValue);
			const parsedEnd = new Date(typeof endValue === 'string' ? parseISO(endValue) : endValue);

			if (startValue && endValue && parsedStart && parsedEnd) {
				if (compareDesc(parsedStart, parsedEnd) < 1) {
					throw new Error(ERROR_START_TIME_MUST_BE_EARLIER_THAN_END_TIME);
				}

			}

			return value;
		});

export default validateTimeRangeParameters;
