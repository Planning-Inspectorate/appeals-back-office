import { getSessionValuesForAppeal } from '#lib/edit-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { getBackLinkUrl } from '../change-procedure-type.controller.js';
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
 * @param {Record<string, string>} sessionValues
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
	const {
		currentAppeal: { appealId }
	} = request;
	const sessionValues = getSessionValuesForAppeal(request, 'changeProcedureType', appealId);

	return renderChangeProcedureEventDate(request, response, sessionValuesToDateTime(sessionValues));
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {{day?: string | number, month?: string | number, year?: string | number, hour?: string | number, minute?: string | number}} values
 */
export const renderChangeProcedureEventDate = async (request, response, values) => {
	const {
		params: { appealId },
		errors
	} = request;

	const appealDetails = request.currentAppeal;
	const sessionValues = getSessionValuesForAppeal(request, 'changeProcedureType', appealId);
	const newProcedureType = sessionValues.appealProcedure;
	const backUrl = getBackLinkUrl(
		request,
		newProcedureType === APPEAL_CASE_PROCEDURE.HEARING
			? `${newProcedureType}/change-event-date-known`
			: 'change-selected-procedure-type'
	);
	const mappedPageContent = eventChangeProcedureDatePage(
		appealDetails,
		values,
		newProcedureType,
		backUrl
	);

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

	const sessionValues = getSessionValuesForAppeal(request, 'changeProcedureType', appealId);
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
			preserveQueryString(
				request,
				`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/estimation`
			)
		);
	}

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/change-timetable`
		)
	);
};
