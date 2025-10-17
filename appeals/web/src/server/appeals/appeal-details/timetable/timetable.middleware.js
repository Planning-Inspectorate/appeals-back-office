import { getAppellantCaseFromAppealId } from '../appellant-case/appellant-case.service.js';
import { getAppealTimetableTypes } from './timetable.mapper.js';
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
	return;
};

/**
 * @type {import('express').RequestHandler}
 */
export const runTimetableValidators = async (req, res, next) => {
	const { currentAppeal } = req || {};
	const { appellantCase } = req.locals;
	let timetableTypes = getAppealTimetableTypes(currentAppeal, appellantCase);
	const validators = selectTimetableValidators(req, timetableTypes, req.session);
	let index = 0;

	// @ts-ignore
	const runNext = (err) => {
		if (err) return next(err);
		const validator = validators[index++];
		if (!validator) return next();
		validator(req, res, runNext);
	};
	runNext();
	return;
};
