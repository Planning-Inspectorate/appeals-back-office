import logger from '#lib/logger.js';
import { mapChangeTimetablePage } from './change-procedure-timetable.mapper.js';

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
		session,
		params: { appealId, procedureType },
		errors,
		locals: { appellantCase }
	} = request;

	const mappedPageContent = mapChangeTimetablePage(
		session.changeProcedureType,
		currentAppeal,
		appellantCase,
		request.body,
		procedureType,
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

		const newProcedureType = request.session.changeProcedureType.appealProcedure;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/check-and-confirm`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
