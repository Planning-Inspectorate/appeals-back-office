/** @typedef {import('express').NextFunction} NextFunction */

import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { isAtEditEntrypoint } from '#lib/edit-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { isEmpty, pick } from 'lodash-es';

/**
 * @typedef {Object} ChangeProcedureType
 * @property {string} appealProcedure
 * @property {string} existingAppealProcedure
 * @property {AppealTimetable} appealTimetable
 * @property {string} event-date-day
 * @property {string} event-date-month
 * @property {string} event-date-year
 * @property {string} event-time-hour
 * @property {string} event-time-minute
 * @property {string} dateKnown
 * @property {string} estimationYesNo
 * @property {string|undefined} estimationDays
 * @property {string} addressKnown
 * @property {string} addressLine1
 * @property {string} addressLine2
 * @property {string} town
 * @property {string} county
 * @property {string} postCode
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
 * @property {string|undefined} [proofOfEvidenceAndWitnessesDueDate]
 */

/**
 * @typedef {Object} ChangeProcedureTypeRequest
 * @property {string} appealProcedure
 * @property {string} existingAppealProcedure
 * @property {string} [lpaQuestionnaireDueDate]
 * @property {string} [ipCommentsDueDate]
 * @property {string} [lpaStatementDueDate]
 * @property {string|undefined} [finalCommentsDueDate]
 * @property {string|undefined} [statementOfCommonGroundDueDate]
 * @property {string|undefined} [planningObligationDueDate]
 * @property {string|undefined} [proofOfEvidenceAndWitnessesDueDate]
 * @property {string} eventDate
 * @property {string|undefined} estimationDays
 * @property {{addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string}|undefined} address
 */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {NextFunction} next
 */
export const updateChangeProcedureTypeSession = (request, response, next) => {
	/** @type {ChangeProcedureType} */
	let sessionValues =
		request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};
	const appealDetails = request.currentAppeal;

	sessionValues.existingAppealProcedure = appealDetails.procedureType.toLowerCase();

	sessionValues.appealProcedure =
		sessionValues.appealProcedure ?? appealDetails.procedureType.toLowerCase();

	switch (sessionValues.appealProcedure) {
		case APPEAL_CASE_PROCEDURE.HEARING: {
			const hearingDate = dateISOStringToDayMonthYearHourMinute(
				appealDetails.hearing?.hearingStartTime
			);

			if (sessionValues.appealProcedure === sessionValues.existingAppealProcedure) {
				sessionValues.dateKnown = appealDetails.hearing?.hearingStartTime ? 'yes' : 'no';
			}

			if (typeof sessionValues.dateKnown !== 'string' && sessionValues.dateKnown !== undefined) {
				sessionValues.dateKnown = hearingDate ? 'yes' : 'no';
			}

			sessionValues['event-date-day'] = sessionValues['event-date-day'] ?? hearingDate?.day;
			sessionValues['event-date-month'] = sessionValues['event-date-month'] ?? hearingDate.month;
			sessionValues['event-date-year'] = sessionValues['event-date-year'] ?? hearingDate.year;
			sessionValues['event-time-hour'] = sessionValues['event-time-hour'] ?? hearingDate.hour;
			sessionValues['event-time-minute'] = sessionValues['event-time-minute'] ?? hearingDate.minute;
			break;
		}
		case APPEAL_CASE_PROCEDURE.INQUIRY: {
			const inquiryDate = dateISOStringToDayMonthYearHourMinute(
				appealDetails.inquiry?.inquiryStartTime
			);
			sessionValues['event-date-day'] = sessionValues['event-date-day'] ?? inquiryDate?.day;
			sessionValues['event-date-month'] = sessionValues['event-date-month'] ?? inquiryDate.month;
			sessionValues['event-date-year'] = sessionValues['event-date-year'] ?? inquiryDate.year;
			sessionValues['event-time-hour'] = sessionValues['event-time-hour'] ?? inquiryDate.hour;
			sessionValues['event-time-minute'] = sessionValues['event-time-minute'] ?? inquiryDate.minute;

			if (sessionValues.appealProcedure === sessionValues.existingAppealProcedure) {
				sessionValues.dateKnown = sessionValues.dateKnown
					? sessionValues.dateKnown
					: appealDetails.inquiry?.inquiryStartTime
					? 'yes'
					: 'no';
				sessionValues.estimationYesNo = sessionValues.estimationYesNo
					? sessionValues.estimationYesNo
					: appealDetails.inquiry?.estimatedDays
					? 'yes'
					: 'no';
				sessionValues.addressKnown = sessionValues.addressKnown
					? sessionValues.addressKnown
					: appealDetails.inquiry?.address
					? 'yes'
					: 'no';
			}

			if (
				typeof sessionValues.estimationYesNo !== 'string' &&
				sessionValues.estimationYesNo !== undefined
			) {
				sessionValues.estimationYesNo = appealDetails.inquiry?.estimatedDays ? 'yes' : 'no';
			}

			sessionValues.estimationDays =
				sessionValues.estimationYesNo === 'no'
					? undefined
					: sessionValues.estimationDays ?? appealDetails.inquiry?.estimatedDays;

			if (
				typeof sessionValues.addressKnown !== 'string' &&
				sessionValues.addressKnown !== undefined
			) {
				sessionValues.addressKnown = appealDetails.inquiry?.address ? 'yes' : 'no';
			}

			const sessionAddressValues = pick(sessionValues, [
				'addressLine1',
				'addressLine2',
				'town',
				'county',
				'postCode'
			]);

			const addressValues =
				sessionValues['addressKnown'] === 'no'
					? pick([], ['addressLine1', 'addressLine2', 'town', 'county', 'postCode'])
					: isEmpty(sessionAddressValues)
					? {
							...pick(appealDetails.inquiry?.address, [
								'addressLine1',
								'addressLine2',
								'town',
								'county'
							]),
							postCode: appealDetails.inquiry?.address
								? appealDetails.inquiry?.address['postcode']
								: null
					  }
					: sessionAddressValues;
			sessionValues = { ...sessionValues, ...addressValues };
			break;
		}
	}

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
	sessionValues.appealTimetable.proofOfEvidenceAndWitnessesDueDate =
		sessionValues.appealTimetable.proofOfEvidenceAndWitnessesDueDate ??
		appealDetails.appealTimetable.proofOfEvidenceAndWitnessesDueDate;

	if (!request.session.changeProcedureType) {
		request.session.changeProcedureType = {};
	}
	request.session.changeProcedureType[request.currentAppeal.appealId] = sessionValues;
	next();
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} url
 * @returns {string}
 */
export const getBackLinkUrl = (request, url) => {
	const baseUrl = `/appeals-service/appeal-details/${request.currentAppeal.appealId}/change-appeal-procedure-type`;
	return isAtEditEntrypoint(request)
		? `${baseUrl}/${request.params.appealProcedure}/check-and-confirm`
		: `${baseUrl}/${url}`;
};
