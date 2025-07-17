import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { HTTPError } from 'got';
import {
	addNeighbouringSiteCheckAndConfirmPage,
	addNeighbouringSitePage,
	changeNeighbouringSiteCheckAndConfirmPage,
	changeNeighbouringSitePage,
	manageNeighbouringSitesPage,
	removeNeighbouringSitePage
} from './neighbouring-sites.mapper.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import {
	addNeighbouringSite,
	changeNeighbouringSite,
	removeNeighbouringSite
} from './neighbouring-sites.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddNeighbouringSite = async (request, response) => {
	return renderAddNeighbouringSite(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAddNeighbouringSite = async (request, response) => {
	const {
		errors,
		params: { source }
	} = request;

	const currentUrl = request.originalUrl;

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -3).join('/');

	const appealsDetail = request.currentAppeal;

	const mappedPageContents = addNeighbouringSitePage(
		appealsDetail,
		// @ts-ignore
		source,
		origin,
		request.session.neighbouringSite,
		errors
	);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddNeighbouringSite = async (request, response) => {
	request.session.neighbouringSite = {
		addressLine1: request.body['addressLine1'],
		addressLine2: request.body['addressLine2'] === '' ? null : request.body['addressLine2'],
		town: request.body['town'],
		county: request.body['county'] === '' ? null : request.body['county'],
		postCode: request.body['postCode']
	};

	const currentUrl = getOriginPathname(request);

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -3).join('/');

	if (!isInternalUrl(origin, request)) {
		return response.status(400).render('errorPageTemplate', {
			message: 'Invalid redirection attempt detected.'
		});
	}

	if (request.errors) {
		return renderAddNeighbouringSite(request, response);
	}
	const {
		params: { source }
	} = request;

	return response.redirect(`${origin}/neighbouring-sites/add/${source}/check-and-confirm`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddNeighbouringSiteCheckAndConfirm = async (request, response) => {
	return renderAddNeighbouringSiteCheckAndConfirm(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAddNeighbouringSiteCheckAndConfirm = async (request, response) => {
	const {
		errors,
		params: { source }
	} = request;

	if (!objectContainsAllKeys(request.session, 'neighbouringSite')) {
		return response.status(500).render('app/500.njk');
	}

	const appealData = request.currentAppeal;

	if (!appealData) {
		return response.status(404).render('app/404.njk');
	}

	const currentUrl = request.originalUrl;

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -4).join('/');

	const mappedPageContent = addNeighbouringSiteCheckAndConfirmPage(
		appealData,
		// @ts-ignore
		source,
		origin,
		request.session.neighbouringSite
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddNeighbouringSiteCheckAndConfirm = async (request, response) => {
	if (!objectContainsAllKeys(request.session, 'neighbouringSite')) {
		return response.status(500).render('app/500.njk');
	}

	const {
		params: { appealId, source }
	} = request;

	if (request.errors) {
		return renderAddNeighbouringSiteCheckAndConfirm(request, response);
	}

	const currentUrl = getOriginPathname(request);

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -4).join('/');

	if (!isInternalUrl(origin, request)) {
		return response.status(400).render('errorPageTemplate', {
			message: 'Invalid redirection attempt detected.'
		});
	}

	try {
		await addNeighbouringSite(
			request.apiClient,
			appealId,
			source,
			request.session.neighbouringSite
		);
		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'neighbouringSiteAdded',
			appealId
		});

		delete request.session.neighbouringSite;

		return response.redirect(origin);
	} catch (error) {
		logger.error(error);

		// Check if it's a validation error (400)
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderAddNeighbouringSiteCheckAndConfirm(request, response);
		}
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getManageNeighbouringSites = async (request, response) => {
	return renderManageNeighbouringSites(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderManageNeighbouringSites = async (request, response) => {
	const appealData = request.currentAppeal;

	const mappedPageContents = manageNeighbouringSitesPage(request, appealData);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContents
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getRemoveNeighbouringSite = async (request, response) => {
	return renderRemoveNeighbouringSite(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderRemoveNeighbouringSite = async (request, response) => {
	const {
		errors,
		params: { siteId }
	} = request;

	const currentUrl = request.originalUrl;

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -4).join('/');

	const appealDetails = request.currentAppeal;

	const mappedPageContents = removeNeighbouringSitePage(appealDetails, origin, siteId, errors);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRemoveNeighbouringSite = async (request, response) => {
	const {
		body,
		errors,
		params: { appealId, siteId },
		currentAppeal
	} = request;

	if (errors) {
		return getRemoveNeighbouringSite(request, response);
	}

	if (!body['remove-neighbouring-site'] || !appealId || !siteId) {
		return response.status(500).render('app/500.njk');
	}

	const currentUrl = getOriginPathname(request);

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -4).join('/');

	if (!isInternalUrl(origin, request)) {
		return response.status(400).render('errorPageTemplate', {
			message: 'Invalid redirection attempt detected.'
		});
	}

	if (body['remove-neighbouring-site'] === 'no') {
		return response.redirect(`${origin}/neighbouring-sites/manage`);
	} else if (body['remove-neighbouring-site'] === 'yes') {
		await removeNeighbouringSite(request.apiClient, appealId, siteId);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'neighbouringSiteRemoved',
			appealId
		});

		const redirectUrl =
			currentAppeal?.neighbouringSites?.length > 1 ? `${origin}/neighbouring-sites/manage` : origin;

		return response.redirect(redirectUrl);
	}
	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeNeighbouringSite = async (request, response) => {
	return renderChangeNeighbouringSite(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeNeighbouringSite = async (request, response) => {
	const {
		errors,
		params: { siteId }
	} = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContents = changeNeighbouringSitePage(
		appealDetails,
		request.session.neighbouringSite,
		siteId,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeNeighbouringSite = async (request, response) => {
	request.session.neighbouringSite = {
		addressLine1: request.body['addressLine1'],
		addressLine2: request.body['addressLine2'] === '' ? null : request.body['addressLine2'],
		town: request.body['town'],
		county: request.body['county'] === '' ? null : request.body['county'],
		postCode: request.body['postCode']
	};

	if (request.errors) {
		return renderChangeNeighbouringSite(request, response);
	}
	const {
		params: { appealId, siteId }
	} = request;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/neighbouring-sites/change/site/${siteId}/check-and-confirm`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeNeighbouringSiteCheckAndConfirm = async (request, response) => {
	return renderChangeNeighbouringSiteCheckAndConfirm(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeNeighbouringSiteCheckAndConfirm = async (request, response) => {
	const {
		errors,
		params: { siteId }
	} = request;

	if (!objectContainsAllKeys(request.session, 'neighbouringSite')) {
		return response.status(500).render('app/500.njk');
	}

	const appealData = request.currentAppeal;

	if (!appealData) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = changeNeighbouringSiteCheckAndConfirmPage(
		appealData,
		request.session.neighbouringSite,
		siteId
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeNeighbouringSiteCheckAndConfirm = async (request, response) => {
	if (!objectContainsAllKeys(request.session, 'neighbouringSite')) {
		return response.status(500).render('app/500.njk');
	}

	const {
		params: { appealId, siteId }
	} = request;

	if (request.errors) {
		return renderChangeNeighbouringSiteCheckAndConfirm(request, response);
	}

	try {
		await changeNeighbouringSite(
			request.apiClient,
			appealId,
			request.session.neighbouringSite,
			siteId
		);
		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'neighbouringSiteUpdated',
			appealId
		});

		delete request.session.neighbouringSite;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
