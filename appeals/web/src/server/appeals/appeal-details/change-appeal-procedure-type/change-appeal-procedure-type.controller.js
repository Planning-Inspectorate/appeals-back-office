/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @typedef {Object} ChangeProcedureType
 * @property {string} appealProcedure
 * @property {string} existingAppealProcedure
 * @property {AppealTimetable} appealTimetable
 */

/**
 * @typedef {Object} AppealTimetable
 * @property {string|undefined} [lpaQuestionnaireDueDate]
 * @property {string|undefined} [ipCommentsDueDate]
 * @property {string|undefined} [appellantStatementDueDate]
 * @property {string|undefined} [lpaStatementDueDate]
 * @property {string|undefined} [finalCommentsDueDate]
 * @property {string|undefined} [statementOfCommonGroundDueDate]
 * @property {string|undefined} [planningObligationDueDate]
 */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {NextFunction} next
 */
export const updateChangeProcedureTypeSession = (request, response, next) => {
	/** @type {ChangeProcedureType} */
	const sessionValues = request.session.changeProcedureType || {};
	const appealDetails = request.currentAppeal;

	sessionValues.existingAppealProcedure = appealDetails.procedureType.toLowerCase();

	sessionValues.appealProcedure =
		sessionValues.appealProcedure ?? appealDetails.procedureType.toLowerCase();

	sessionValues.appealTimetable = sessionValues.appealTimetable || {};

	sessionValues.appealTimetable.lpaQuestionnaireDueDate =
		sessionValues.appealTimetable.lpaQuestionnaireDueDate ??
		appealDetails.appealTimetable.lpaQuestionnaireDueDate;

	sessionValues.appealTimetable.ipCommentsDueDate =
		sessionValues.appealTimetable.ipCommentsDueDate ??
		appealDetails.appealTimetable.ipCommentsDueDate;
	sessionValues.appealTimetable.lpaStatementDueDate =
		sessionValues.appealTimetable.lpaStatementDueDate ??
		(appealDetails.appealTimetable.lpaStatementDueDate ||
			appealDetails.appealTimetable.appellantStatementDueDate);
	sessionValues.appealTimetable.finalCommentsDueDate =
		sessionValues.appealTimetable.finalCommentsDueDate ??
		appealDetails.appealTimetable.finalCommentsDueDate;
	sessionValues.appealTimetable.statementOfCommonGroundDueDate =
		sessionValues.appealTimetable.statementOfCommonGroundDueDate ||
		appealDetails.appealTimetable.statementOfCommonGroundDueDate;
	sessionValues.appealTimetable.planningObligationDueDate =
		sessionValues.appealTimetable.planningObligationDueDate ??
		appealDetails.appealTimetable.planningObligationDueDate;

	request.session.changeProcedureType = sessionValues;

	next();
};
