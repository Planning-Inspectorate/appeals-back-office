/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {NextFunction} next
 */
export const updateChangeProcedureTypeSession = (request, response, next) => {
	const sessionValues = request.session || {};
	const appealDetails = request.currentAppeal;

	sessionValues['existingAppealProcedure'] = appealDetails.procedureType.toLowerCase();

	sessionValues['appealProcedure'] =
		sessionValues['appealProcedure'] ?? appealDetails.procedureType.toLowerCase();

	sessionValues['appealTimetable'] = sessionValues.appealTimetable || {};

	sessionValues.appealTimetable['lpaQuestionnaireDueDate'] =
		sessionValues.appealTimetable['lpaQuestionnaireDueDate'] ??
		appealDetails.appealTimetable.lpaQuestionnaireDueDate;

	sessionValues.appealTimetable['ipCommentsDueDate'] =
		sessionValues.appealTimetable['ipCommentsDueDate'] ??
		appealDetails.appealTimetable.ipCommentsDueDate;
	sessionValues.appealTimetable['lpaStatementDueDate'] =
		sessionValues.appealTimetable['lpaStatementDueDate'] ??
		(appealDetails.appealTimetable.lpaStatementDueDate ||
			appealDetails.appealTimetable.appellantStatementDueDate);
	sessionValues.appealTimetable['finalCommentsDueDate'] =
		sessionValues.appealTimetable['finalCommentsDueDate'] ??
		appealDetails.appealTimetable.finalCommentsDueDate;

	request.session = sessionValues;

	next();
};
