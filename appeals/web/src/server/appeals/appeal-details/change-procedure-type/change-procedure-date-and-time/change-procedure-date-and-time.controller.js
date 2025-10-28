import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { eventChangeProcedureDatePage } from './change-procedure-date-and-time.mapper.js';

/**
 * @param {string} path
 * @param {string} sessionKey
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const redirectAndClearSession = (path, sessionKey) => (request, response) => {
	delete request.session[sessionKey];

	response.redirect(`${request.baseUrl}${path}`);
};

/**
 * @param {{'event-date-day': string, 'event-date-month': string, 'event-date-year': string, 'event-time-hour': string, 'event-time-minute': string}} sessionValues
 * @returns {{day: string, month: string, year: string, hour: string, minute: string}}
 */
const sessionValuesToDateTime = (sessionValues) => {
	return {
		day: sessionValues['event-date-day'] || '',
		month: sessionValues['event-date-month'] || '',
		year: sessionValues['event-date-year'] || '',
		hour: sessionValues['event-time-hour'] || '',
		minute: sessionValues['event-time-minute'] || ''
	};
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeProcedureEventDate = async (request, response) => {
	const sessionValues =
		request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};

	return renderChangeProcedureEventDate(request, response, sessionValuesToDateTime(sessionValues));
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {{day?: string | number, month?: string | number, year?: string | number, hour?: string | number, minute?: string | number}} values
 */
export const renderChangeProcedureEventDate = async (request, response, values) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;
	const sessionValues =
		request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};
	const newProcedureType = sessionValues.appealProcedure;
	const mappedPageContent = eventChangeProcedureDatePage(appealDetails, values, newProcedureType);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeProcedureEventDate = async (request, response) => {
	const {
		errors,
		params: { appealId }
	} = request;

	const sessionValues =
		request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};
	if (errors) {
		return renderChangeProcedureEventDate(
			request,
			response,
			sessionValuesToDateTime(sessionValues)
		);
	}

	const newProcedureType = sessionValues.appealProcedure;

	if (newProcedureType === APPEAL_CASE_PROCEDURE.INQUIRY) {
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/estimation`
		);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/change-timetable`
	);
};
