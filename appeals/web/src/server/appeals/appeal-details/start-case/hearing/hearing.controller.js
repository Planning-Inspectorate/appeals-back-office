import { sessionValuesToDateTime } from '#appeals/appeal-details/hearing/setup/set-up-hearing.controller.js';
import { hearingDatePage } from '#appeals/appeal-details/hearing/setup/set-up-hearing.mapper.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { applyEdits, getSessionValues, isAtEditEntrypoint } from '#lib/edit-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { dateKnownPage } from './hearing.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} prevPagePath
 * @returns {string}
 */
const getBackLinkUrl = (request, prevPagePath) => {
	const baseUrl = `/appeals-service/appeal-details/${request.currentAppeal.appealId}/start-case`;
	return isAtEditEntrypoint(request) ? `${baseUrl}/hearing/confirm` : `${baseUrl}/${prevPagePath}`;
};

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
	const backLinkUrl = getBackLinkUrl(request, 'select-procedure');

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

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingDate = async (request, response) => {
	return renderHearingDate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderHearingDate = async (request, response) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;
	const backLinkUrl = getBackLinkUrl(request, 'hearing');
	const sessionValues = getSessionValues(request, 'startCaseHearing');
	const values = sessionValues
		? sessionValuesToDateTime(sessionValues)
		: request.currentAppeal.hearing;

	const mappedPageContent = hearingDatePage(appealDetails, values, backLinkUrl, {
		title: 'Hearing date and time - start case',
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)} - start case`,
		heading: 'Hearing date and time'
	});

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postHearingDate = async (request, response) => {
	if (request.errors) {
		return renderHearingDate(request, response);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/start-case/hearing/confirm`
	);
};
