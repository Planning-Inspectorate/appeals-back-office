import { preserveQueryString } from '#lib/url-utilities.js';
import { getBackLinkUrl } from '../change-procedure-type.controller.js';
import { dateKnownPage } from './change-procedure-event-date-known.mapper.js';

/** @typedef {import('@pins/express').ValidationErrors} ValidationErrors */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getEventDateKnown = async (request, response) => {
	return renderEventDateKnown(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderEventDateKnown = async (request, response) => {
	const { errors } = request;
	const appealDetails = request.currentAppeal;
	const backLinkUrl = getBackLinkUrl(request, 'change-selected-procedure-type');
	const sessionValues =
		request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};
	const newProcedureType = sessionValues.appealProcedure;
	const mappedPageContent = dateKnownPage(
		appealDetails,
		backLinkUrl,
		newProcedureType,
		sessionValues
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
export const postEventDateKnown = async (request, response) => {
	const {
		errors,
		currentAppeal: { appealId },
		body: { dateKnown }
	} = request;

	if (errors) {
		return renderEventDateKnown(request, response);
	}
	const sessionValues =
		request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};
	const newProcedureType = sessionValues.appealProcedure;
	const baseUrl = `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}`;

	if (dateKnown === 'yes') {
		// Answer was yes so we progress to the next page
		sessionValues['noEventDate'] = true;
		return response.redirect(preserveQueryString(request, `${baseUrl}/date`));
	}

	delete sessionValues['event-date-day'];
	delete sessionValues['event-date-month'];
	delete sessionValues['event-date-year'];
	delete sessionValues['event-time-hour'];
	delete sessionValues['event-time-minute'];
	sessionValues['isEventDate'] = false;

	return response.redirect(`${baseUrl}/change-timetable`);
};
