import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { timingsPage, checkDetailsPage } from './estimates.mapper.js';
import { createInquiryEstimates, updateInquiryEstimates } from './estimates.service.js';

/**
 * @param {string} path
 * @param {string} sessionKey
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const redirectAndClearSession = (path, sessionKey) => (request, response) => {
	const { currentAppeal } = request;

	delete request.session[sessionKey];

	response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/estimates${path}`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddTimings = async (request, response) => {
	return renderAddTimings(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeTimings = async (request, response) => {
	return renderChangeTimings(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAddTimings = async (request, response) => {
	const { errors } = request;
	const appealDetails = request.currentAppeal;
	const values = request.session.inquiryEstimates || {};

	const mappedPageContent = await timingsPage(appealDetails, values, errors);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderChangeTimings = async (request, response) => {
	const { currentAppeal, errors } = request;
	const appealDetails = request.currentAppeal;
	const values = request.session.inquiryEstimates || currentAppeal.inquiryEstimate;

	const mappedPageContent = await timingsPage(appealDetails, values, errors);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddTimings = async (request, response) => {
	if (request.errors) {
		return renderAddTimings(request, response);
	}

	const { appealId } = request.currentAppeal;
	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/inquiry/estimates/add/check-details`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeTimings = async (request, response) => {
	if (request.errors) {
		return renderChangeTimings(request, response);
	}

	const { appealId } = request.currentAppeal;
	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/inquiry/estimates/change/check-details`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAlreadySubmittedError = (request, response) => {
	return response.status(404).render('app/404.njk', {
		titleCopy: 'You cannot check these answers',
		bodyCopy: [
			'It looks like you may have already submitted the data.',
			`Continue to <a class="govuk-link" href="/appeals-service/appeal-details/${request.currentAppeal.appealId}">appeal details</a>`
		]
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddCheckDetails = async (request, response) => {
	if (!request.session.inquiryEstimates) {
		return renderAlreadySubmittedError(request, response);
	}

	const mappedPageContent = checkDetailsPage(
		request.currentAppeal,
		request.session.inquiryEstimates,
		'add'
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeCheckDetails = async (request, response) => {
	if (!request.session.inquiryEstimates) {
		return renderAlreadySubmittedError(request, response);
	}

	const mappedPageContent = checkDetailsPage(
		request.currentAppeal,
		request.session.inquiryEstimates,
		'update'
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddCheckDetails = async (request, response) => {
	const { appealId } = request.currentAppeal;
	const estimates = request.session.inquiryEstimates;

	if (!request.session.inquiryEstimates) {
		return renderAlreadySubmittedError(request, response);
	}

	try {
		await createInquiryEstimates(request, {
			preparationTime: parseFloat(estimates.preparationTime),
			sittingTime: parseFloat(estimates.sittingTime),
			reportingTime: parseFloat(estimates.reportingTime)
		});

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'inquiryEstimatesAdded',
			appealId
		});

		delete request.session.inquiryEstimates;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeCheckDetails = async (request, response) => {
	const { appealId } = request.currentAppeal;
	const estimates = request.session.inquiryEstimates;

	if (!request.session.inquiryEstimates) {
		return renderAlreadySubmittedError(request, response);
	}

	try {
		await updateInquiryEstimates(request, {
			preparationTime: parseFloat(estimates.preparationTime),
			sittingTime: parseFloat(estimates.sittingTime),
			reportingTime: parseFloat(estimates.reportingTime)
		});

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'inquiryEstimatesChanged',
			appealId
		});

		delete request.session.inquiryEstimates;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
