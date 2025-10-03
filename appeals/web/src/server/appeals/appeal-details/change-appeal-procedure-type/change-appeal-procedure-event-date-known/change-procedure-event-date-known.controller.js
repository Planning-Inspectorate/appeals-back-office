import { getSessionValuesForAppeal } from '#lib/edit-utilities.js';
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
	const {
		errors,
		params: { procedureType }
	} = request;

	const appealDetails = request.currentAppeal;
	const backLinkUrl = getBackLinkUrl(request, 'change-selected-procedure-type');
	const sessionValues = getSessionValuesForAppeal(
		request,
		'changeProcedureType',
		appealDetails.appealId
	);

	const mappedPageContent = dateKnownPage(appealDetails, backLinkUrl, procedureType, sessionValues);

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
		body: { dateKnown },
		params: { procedureType }
	} = request;

	if (errors) {
		return renderEventDateKnown(request, response);
	}

	const baseUrl = `/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType}`;

	if (dateKnown === 'yes') {
		// Answer was yes so we progress to the next page
		return response.redirect(preserveQueryString(request, `${baseUrl}/date`));
	}
	return response.redirect(`${baseUrl}/change-timetable`);
};
