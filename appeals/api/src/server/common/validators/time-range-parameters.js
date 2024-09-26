import {
	ERROR_START_TIME_MUST_BE_EARLIER_THAN_END_TIME } from '#endpoints/constants.js';
import { parseISO, compareDesc } from 'date-fns';
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

			if (startValue && endValue) {
				if (compareDesc(parseISO(startValue), parseISO(endValue)) < 1) {
					throw new Error(ERROR_START_TIME_MUST_BE_EARLIER_THAN_END_TIME);
				}
			}

			return value;
		});

export default validateTimeRangeParameters;
