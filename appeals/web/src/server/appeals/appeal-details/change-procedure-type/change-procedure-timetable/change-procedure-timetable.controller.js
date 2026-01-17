import { applyEditsForAppeal, getSessionValuesForAppeal } from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { getBackLinkUrl } from '../change-procedure-type.controller.js';
import { mapChangeTimetablePage } from './change-procedure-timetable.mapper.js';

/**
 * @typedef {import('../change-procedure-type.controller.js').ChangeProcedureType} ChangeProcedureTypeSession
 */

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getChangeAppealTimetable = async (request, response) => {
	renderChangeAppealTimetable(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeAppealTimetable = async (request, response) => {
	const {
		currentAppeal,
		params: { appealId, procedureType },
		errors,
		locals: { appellantCase },
		session
	} = request;
	const sessionValues = /** @type {ChangeProcedureTypeSession} */ (
		/** @type {unknown} */ (getSessionValuesForAppeal(request, 'changeProcedureType', appealId))
	);
	const newProcedureType = sessionValues.appealProcedure;
	const backUrl = getBackLinkUrl(
		request,
		procedureType === APPEAL_CASE_PROCEDURE?.WRITTEN
			? 'change-selected-procedure-type'
			: procedureType === APPEAL_CASE_PROCEDURE.HEARING && session.dateKnown === 'yes'
				? `${newProcedureType}/date`
				: procedureType === APPEAL_CASE_PROCEDURE.HEARING && session.dateKnown === 'no'
					? `${newProcedureType}/change-event-date-known`
					: procedureType === APPEAL_CASE_PROCEDURE.INQUIRY && session.addressKnown === 'no'
						? `${newProcedureType}/address-known`
						: `${newProcedureType}/address-details`
	);
	const mappedPageContent = mapChangeTimetablePage(
		sessionValues,
		currentAppeal,
		appellantCase,
		request.body,
		backUrl,
		errors
	);

	if (!appealId || !mappedPageContent) {
		return response.status(500).render('app/500.njk');
	}

	return response.status(200).render('appeals/appeal/update-date.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeAppealTimetable = async (request, response) => {
	try {
		const {
			errors,
			params: { appealId }
		} = request;

		if (errors) {
			return renderChangeAppealTimetable(request, response);
		}

		const sessionValues = getSessionValuesForAppeal(request, 'changeProcedureType', appealId);
		const newProcedureType = sessionValues.appealProcedure;

		applyEditsForAppeal(request, 'changeProcedureType', appealId);

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/check-and-confirm`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
