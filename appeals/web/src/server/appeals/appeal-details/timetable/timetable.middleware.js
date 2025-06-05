import { getAppellantCaseFromAppealId } from '../appellant-case/appellant-case.service.js';
import { selectTimetableValidators } from './timetable.validators.js';

/**
 * @type {import('express').RequestHandler}
 */
export const addAppellantCaseToLocals = async (req, _res, next) => {
	try {
		const appellantCase = await getAppellantCaseFromAppealId(
			req.apiClient,
			req.currentAppeal.appealId,
			req.currentAppeal.appellantCaseId
		);
		req.locals.appellantCase = appellantCase;
	} catch (error) {
		next(error);
	}
	next();
};

/**
 * @type {import('express').RequestHandler}
 */
export const runTimetableValidators = async (req, res, next) => {
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
