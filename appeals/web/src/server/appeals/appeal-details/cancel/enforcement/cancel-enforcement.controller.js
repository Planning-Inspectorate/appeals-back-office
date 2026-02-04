import * as appellantCaseService from '#appeals/appeal-details/appellant-case/appellant-case.service.js';
import { getSessionValuesForAppeal } from '#lib/edit-utilities.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { isDefined } from '#lib/ts-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { invalidReasonPage, legalInterestPage } from './cancel-enforcement.mapper.js';

const getBackLinkUrl = backLinkGenerator('cancelAppeal');

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInvalidReason = async (request, response) => {
	const { currentAppeal } = request;

	const values = getSessionValuesForAppeal(request, 'cancelAppeal', currentAppeal.appealId);

	return renderInvalidReason(request, response, values);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {Record<string, string>} values
 */
const renderInvalidReason = async (request, response, values) => {
	const { errors, currentAppeal } = request;

	const invalidReasons = await appellantCaseService.getAppellantCaseNotValidReasonOptionsForOutcome(
		request.apiClient,
		'invalid'
	);

	// Ordered list of IDs of invalid reasons to be shown for this flow
	const invalidReasonIds = [1, 2, 6, 3, 4];
	/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').ReasonOption[]} */
	const filteredInvalidReasons = invalidReasonIds
		.map((id) => invalidReasons.find((reason) => reason.id === id))
		.filter(isDefined);

	const cancelUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/cancel`;
	const backUrl = getBackLinkUrl(request, cancelUrl, `${cancelUrl}/enforcement/check-details`);

	const pageContent = invalidReasonPage(
		currentAppeal,
		filteredInvalidReasons,
		backUrl,
		values,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInvalidReason = async (request, response) => {
	const { body, currentAppeal, errors } = request;

	if (errors) {
		return renderInvalidReason(request, response, body);
	}

	const nextPage = body.invalidReason.includes('6') ? 'legal-interest' : 'other-live-appeals';

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${currentAppeal.appealId}/cancel/enforcement/${nextPage}`
		)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getLegalInterest = async (request, response) => {
	const { currentAppeal } = request;

	const values = getSessionValuesForAppeal(request, 'cancelAppeal', currentAppeal.appealId);

	return renderLegalInterest(request, response, values);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {Record<string, string>} values
 */
const renderLegalInterest = async (request, response, values) => {
	const { errors, currentAppeal } = request;

	const cancelUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/cancel`;
	const backUrl = getBackLinkUrl(
		request,
		`${cancelUrl}/enforcement/invalid`,
		`${cancelUrl}/enforcement/check-details`
	);

	const pageContent = legalInterestPage(currentAppeal, backUrl, values, errors);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postLegalInterest = async (request, response) => {
	const { body, currentAppeal, errors } = request;

	if (errors) {
		return renderLegalInterest(request, response, body);
	}

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${currentAppeal.appealId}/cancel/enforcement/other-live-appeals`
		)
	);
};
