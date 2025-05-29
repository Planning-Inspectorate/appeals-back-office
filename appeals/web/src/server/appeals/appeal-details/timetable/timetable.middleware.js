import { selectTimetableValidators } from './timetable.validators.js';

/**
 * @type {import('express').RequestHandler}
 */
export const runTimetableValidators = (req, res, next) => {
	const validators = selectTimetableValidators(req);
	let index = 0;

	// @ts-ignore
	const runNext = (err) => {
		if (err) return next(err);
		const validator = validators[index++];
		if (!validator) return next();
		validator(req, res, runNext);
	};
	runNext();
};
