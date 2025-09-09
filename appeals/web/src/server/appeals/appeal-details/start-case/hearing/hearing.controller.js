import { applyEdits, getSessionValues, isAtEditEntrypoint } from '#lib/edit-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { dateKnownPage } from './hearing.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingDateKnown = async (request, response) => {
	return renderHearingDateKnown(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderHearingDateKnown = async (request, response) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;
	const { appealId } = appealDetails;
	const backLinkUrl = isAtEditEntrypoint(request)
		? `/appeals-service/appeal-details/${appealId}/start-case/hearing/confirm`
		: `/appeals-service/appeal-details/${appealId}/start-case/select-procedure`;

	const mappedPageContent = dateKnownPage(
		appealDetails,
		backLinkUrl,
		getSessionValues(request, 'startCaseHearing')
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
export const postHearingDateKnown = async (request, response) => {
	if (request.errors) {
		return renderHearingDateKnown(request, response);
	}

	const { appealId } = request.currentAppeal;

	const baseUrl = `/appeals-service/appeal-details/${appealId}/start-case/hearing`;

	if (request.body.dateKnown === 'yes') {
		// Answer was yes so we progress to the next page
		return response.redirect(preserveQueryString(request, `${baseUrl}/date`));
	}

	// Answer was no so we apply any edits and proceed to CYA page
	applyEdits(request, 'startCaseHearing');
	return response.redirect(`${baseUrl}/confirm`);
};
