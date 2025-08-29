import { selectTimetableValidators } from '#appeals/appeal-details/timetable/timetable.validators.js';
import { getTimetableTypes } from './change-appeal-timetable.mapper.js';

/**
 * @type {import('express').RequestHandler}
 */
export const runTimetableValidators = async (req, res, next) => {
	const { currentAppeal } = req || {};
	const { appellantCase } = req.locals;
	const changeProcedureTypeSession = req.session.changeProcedureType || {};
	const timetableTypes = getTimetableTypes(
		currentAppeal.appealType,
		appellantCase.planningObligation?.hasObligation,
		changeProcedureTypeSession?.appealProcedure
	);
	const validators = selectTimetableValidators(req, timetableTypes, changeProcedureTypeSession);
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
