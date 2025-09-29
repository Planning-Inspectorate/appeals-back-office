import { inquiryChangeProcedureDatePage } from './change-appeal-date-and-time.mapper.js';

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
 * @param {{'inquiry-date-day': string, 'inquiry-date-month': string, 'inquiry-date-year': string, 'inquiry-time-hour': string, 'inquiry-time-minute': string}} sessionValues
 * @returns {{day: string, month: string, year: string, hour: string, minute: string}}
 */
const sessionValuesToDateTime = (sessionValues) => {
	return {
		day: sessionValues['inquiry-date-day'] || '',
		month: sessionValues['inquiry-date-month'] || '',
		year: sessionValues['inquiry-date-year'] || '',
		hour: sessionValues['inquiry-time-hour'] || '',
		minute: sessionValues['inquiry-time-minute'] || ''
	};
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeProcedureInquiryDate = async (request, response) => {
	const sessionValues = request.session['changeProcedureType'] || {};

	return renderChangeProcedureInquiryDate(
		request,
		response,
		sessionValuesToDateTime(sessionValues)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {{day?: string | number, month?: string | number, year?: string | number, hour?: string | number, minute?: string | number}} values
 */
export const renderChangeProcedureInquiryDate = async (request, response, values) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContent = await inquiryChangeProcedureDatePage(appealDetails, values);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeProcedureInquiryDate = async (request, response) => {
	if (request.errors) {
		return renderChangeProcedureInquiryDate(
			request,
			response,
			sessionValuesToDateTime(request.session['changeProcedureType'] || {})
		);
	}

	const { appealId, procedureType } = request.currentAppeal;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType.toLowerCase()}/estimation`
	);
};
